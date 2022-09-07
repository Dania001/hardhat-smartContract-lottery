const {developmentChains} =require("../helper-hardhat-config")
const {network} = require ("hardhat")

const BASE_FEE = "250000000000000000"
const GAS_PRICE_LINK = 1e9

module.exports = async ({getNamedAccounts, deployments}) => {
const {deploy, log} = deployments
const {deployer} = await getNamedAccounts()
const chainId = network.config.chainId
const args = [BASE_FEE,GAS_PRICE_LINK]

if(developmentChains.includes(network.name)){
log("local network detected....deploying mocks.....")
await deploy("VRFCoordinatorV2Mock",{
from:deployer,
log:true,
args:args,
})
log("mock deployed...")
log("................................")
}
}


module.exports.tags = ["all", "mocks"]