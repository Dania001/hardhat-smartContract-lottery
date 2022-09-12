const {developmentChains, networkConfig} = require("../../helper-hardhat-config")
const {getNamedAccounts, deployments, ethers} = require("hardhat")
const {assert, expect} = require("chai")

!developmentChains.includes(network.name)
?describe.skip
:describe("raffle unit test", async function(){
let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval
const chainId = network.config.chainId

beforeEach(async function(){
deployer= (await getNamedAccounts()).deployer
await deployments.fixture(["all"])
raffle =  await ethers.getContract("Raffle", deployer)
vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
raffleEntranceFee = await raffle.getEntranceFee()
interval = await raffle.getInterval()
})

describe("constructor", async function(){
it("initializes the raffle correctly", async function(){
const raffleState = await raffle.getRaffleState()
assert.equal(raffleState.toString(),"0")
assert.equal(interval.toString(), networkConfig[chainId]["interval"])
})
})
describe("enterRaffle", async function(){
it("reverts back when you do not pay enough", async function(){
await expect(raffle.enterRaffle()).to.be.revertedWith('Raffle__SendMoreToEnterRaffle')
})
it("records players when they enter", async function(){
await raffle.enterRaffle({value:raffleEntranceFee})
const playerFromContract = await raffle.getPlayer(0)
assert.equal(playerFromContract, deployer)
})
it("emits event on enter", async function(){
await expect(raffle.enterRaffle({value:raffleEntranceFee})).to.emit(raffle,"RaffleEnter")
})
it("does not allow entry when raffle is calculating", async function(){
await raffle.enterRaffle({value:raffleEntranceFee})
await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
await network.provider.send("evm_mine", [])
await raffle.performUpkeep([])
await expect(raffle.enterRaffle({value:raffleEntranceFee})).to.be.revertedWith("Raffle__RaffleNotOpen")
})
})
describe("checkUpkeep", async function(){
it("return false if people have not sent ether", async function(){
await network.provider.send("evm_increaseTime",[interval.toNumber() + 1])
await network.provider.send("evm_mine", [])
const {upkeepNeeded} = await raffle.callStatic.checkUpkeep([])
assert(!upkeepNeeded)
})
it("return false if raffle is not open", async function(){
await raffle.enterRaffle({value:raffleEntranceFee})
await network.provider.send("evm_increaseTime",[interval.toNumber()+1])
await network.provider.send("evm_mine",[])
await raffle.performUpkeep([])
const raffleState = await raffle.getRaffleState()
const {upkeepNeeded} = await raffle.callStatic.checkUpkeep([])
assert.equal(raffleState.toString(),"1")
assert.equal(upkeepNeeded,false)
})
it("return false if enough time has not passed",async ()=>{
await raffle.enterRaffle({value:raffleEntranceFee})
await network.provider.send("evm_increaseTime", [interval.toNumber() -1])
await network.provider.request({method:"evm_mine", params:[]})
const {upkeepNeeded} = await raffle.callStatic.checkUpkeep([])
assert(!upkeepNeeded)
})
it("returns true if enough time has passed, has enough eth, has players,and raffle is open", async ()=>{
await raffle.enterRaffle({value:raffleEntranceFee})
await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
await network.provider.request({method:"evm_mine", params:[]})
const {upkeepNeeded} = await raffle.callStatic.checkUpkeep([])
assert(upkeepNeeded)
})
})
describe("performUpkeep", async function(){
it("run only if checkUpkeep is true", async function(){
await raffle.enterRaffle({value:raffleEntranceFee})
await network.provider.send("evm_increaseTime",[interval.toNumber() + 1])
await network.provider.send("evm_mine",[])
const transaction = await raffle.performUpkeep([])
assert(transaction)
})
it("revert when checkUpkeep is false", async function(){
await expect(raffle.performUpkeep([])).to.be.revertedWith("Raffle__UpkeepNotNeeded")
})
it("updates the raffle state, emits an event and call a vrfCoordinator", async function(){
await raffle.enterRaffle({value:raffleEntranceFee})
await network.provider.send("evm_increaseTime",[interval.toNumber() + 1])
await network.provider.send("evm_mine",[])
const transactionResponse = await raffle.performUpkeep([])
const transactionReceipt = await transactionResponse.wait(1)
const requestId = transactionReceipt.events[1].args.requestId
const raffleState = await raffle.getRaffleState()
assert(requestId.toNumber() > 0)
assert(raffleState.toString() == "1")
})
})
describe("fulfillRandomWords", function(){
beforeEach(async () => {
await raffle.enterRaffle({value:raffleEntranceFee})
await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
await network.provider.request({method:"evm_mine", params:[]})
})
it("can only be called after performUpkeep", async () =>{
await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)).to.be.revertedWith("nonexistent request")
await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)).to.be.revertedWith("nonexistent request")
})
it("picks a winner, resets the lottery, and sends money", async () =>{
const additionalParticipants = 3
const startingAccountIndex = 1
const accounts = await ethers.getSigners()
for(let i = startingAccountIndex; i< startingAccountIndex + additionalParticipants; i++){
const accountConnectedRaffle = raffle.connect(accounts[i])
await accountConnectedRaffle.enterRaffle({value:raffleEntranceFee})
}
const startingTimeStamp = await raffle.getLastTimeStamp()
await new Promise(async (resolve, reject) =>{
raffle.once("WinnerPicked", async() =>{
console.log("found the event")
try{
const recentWinner = raffle.getRecentWinner()
const raffleState =raffle.getRaffleState()
const endingTimeStamp = raffle.getLastTimeStamp()
const numPlayer = raffle.getNumberOfPlayers()
const winnerEndingBalance = await accounts[1].getBalance()
assert.equal(numPlayer.toString(),"0")
assert.equal(raffleState.toString(),"0")
assert(endingTimeStamp > startingTimeStamp)
assert.equal(
winnerEndingBalance.toString(),
winnerStartingBalance.add(
raffleEntranceFee
.mul(additionalParticipants)
.add(raffleEntranceFee).toString()))
resolve()
}catch(e){
reject(e)
}
})
const  transactionResponse = await raffle.performUpkeep([])
const transactionReceipt = await transactionResponse.wait(1)
const winnerStartingBalance = await accounts[1].getBalance()
await vrfCoordinatorV2Mock.fulfillRandomWords(transactionReceipt.events[1].args.requestId,raffle.address)
})
})
})
})
