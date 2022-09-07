const {developmentChains, networkConfig} = require("../../helper-hardhat-config")
const {getNamedAccounts, deployments, ethers} = require("hardhat")
const {assert} = require("chai")

!developmentChains.includes(network.name)
?describe.skip
:describe("raffle unit test", async function(){
let raffle, vrfCoordinatorV2Mock
const chainId = network.config.chainId

beforeEach(async function(){
const {deployer} = await getNamedAccounts()
await deployments.fixture(["all"])
raffle =  await ethers.getContract("Raffle", deployer)
vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
})

describe("constructor", async function(){
it("initializes the raffle correctly", async function(){
const raffleState = raffle.getRaffleState()
const interval = raffle.getInterval()
assert.equal(raffleState.toString(),"0")
assert.equal(interval,toString(), networkConfig[chainId]["interval"])
})
})

})