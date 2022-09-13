
/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
//require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

const RINKEBY_RPC_URL = "https://eth-rinkeby.alchemyapi.io/v2/4HBeV5vdETv5cGGu9o4QOfgbAruHsH9V"

const PRIVATE_KEY = "32ef2268837ff23e761dbc31d644ea530360b999ea4ac80074b4070de0cc1416"

const ETHERSCAN_API_KEY = "JX48E9CTPT2ZD2Q755F5FSJ7AYG4H9VNPM"


module.exports = {
  defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost:{
           chainId: 31337,
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            blockConfirmations: 6,
            saveDeployments: true,
        },
    },
  solidity: {
        compilers: [
            {
                version: "0.8.7",
            },
            {
                version: "0.4.24",
            },
        ],
    },
  namedAccounts: {
        deployer: {
            default: 0,

        },
        player: {
            default: 1,
        },
    },
   contractSizer: {
        runOnCompile: false,
        only: ["Raffle"],
    },
    mocha: {
        timeout: 500000, // 500 seconds max for running tests
    },
    etherscan: {
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: {
            rinkeby: ETHERSCAN_API_KEY,
            goerli: ETHERSCAN_API_KEY,
            // polygon: POLYGONSCAN_API_KEY,
        },
    },
};
