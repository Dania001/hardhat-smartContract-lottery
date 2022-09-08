const { network, ethers} = require("hardhat")
const {developmentChains, networkConfig} = require ("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const FUND_ETH_AMOUNT =  "1000000000000000000000"

module.exports = async ({getNamedAccounts, deployments}) => {
const{deploy,log} = deployments
const{deployer} = await getNamedAccounts()
const chainId = network.config.chainId
let vrfCoordinatorV2Address,subscriptionId,vrfCoordinatorV2Mock


if (developmentChains.includes(network.name)){
const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
const transactionReceipt = await transactionResponse.wait()
const subscriptionId = transactionReceipt.events[0].args.subId
await vrfCoordinatorV2Mock.fundSubscription(subscriptionId,FUND_ETH_AMOUNT)
}else{
vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
subscriptionId = networkConfig[chainId]["subscriptionId"]
}

const entranceFee = networkConfig[chainId]["entranceFee"]
const gasLane = networkConfig[chainId]["gasLane"]
const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
const interval = networkConfig[chainId]["interval"]

const raffle= await deploy("Raffle",{
from: deployer,
args:[vrfCoordinatorV2Address, subscriptionId,gasLane,interval,entranceFee,callbackGasLimit],
log:true,
waitConfirmations :network.config.blockConfirmations || 1
})


if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
log("verifying...................")
await verify(raffle.address, args)
}
log("........................")
}

module.exports.tags = ["all", "raffle"]
