const {developmentChains, networkConfig} = require("../../helper-hardhat-config")
const {getNamedAccounts, deployments, ethers} = require("hardhat")
const {assert, expect} = require("chai")

developmentChains.includes(network.name)
?describe.skip
:describe("raffle unit test", async function(){
let raffle, raffleEntranceFee, deployer

beforeEach(async function(){
deployer= (await getNamedAccounts()).deployer
raffle =  await ethers.getContract("Raffle", deployer)
raffleEntranceFee = await raffle.getEntranceFee()
})
describe("fulfillRandomWords", function(){
it("it works with chainlink keepers and chainlink Vrf, we automatically get a random winner", async function(){
const startingTimeStamp = await raffle.getLastTimeStamp()
const accounts = await ethers.getSigners()
await new Promise(async (resolve, reject) =>{
raffle.once("WinnerPicked", async() =>{
console.log("found the event")
try{
const recentWinner = await raffle.getRecentWinner()
const raffleState = await raffle.getRecentWinner()
const winnerEndingBalance = await accounts[0].getBalance()
const endingTimeStamp = await raffle.getLastTimeStamp()

await expect(raffle.getPlayer(0)).to.be.reverted
assert.equal(recentWinner.toString(),accounts[0].address)
assert.equal(raffleState,0)
assert.equal(winnerEndingBalance.toString(), winnerStartingBalance.add(raffleEntranceFee).toString())
assert(endingTimeStamp > startingTimeStamp)
resolve()
}catch(e){
console.log(error)
reject(e)
}
})
await raffle.enterRaffle({value:raffleEntranceFee})
const winnerStartingBalance = await accounts[0].getBalance()
})
})
})
})