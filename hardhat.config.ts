// import "@nomicfoundation/hardhat-foundry"; // TODO: Check Hardhat v3 compatibility
import "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { config as dotenvConfig } from "dotenv";
// import "hardhat-deploy"; // TODO: Check Hardhat v3 compatibility
import type { HardhatUserConfig } from "hardhat/config";
// import { vars } from "hardhat/config"; // TODO: Update for Hardhat v3
import type { HardhatNetworkChainsUserConfig, HardhatNetworkUserConfig } from "hardhat/types";

import { AllChainIds, SupportedChainId, chainNames, isValidChainId } from "./config/chains.js";
import { getExplorerConfiguration } from "./config/explorers.js";
import { getForkChainConfig, getNetworksConfiguration } from "./config/networks.js";
// import "./tasks/accounts.js"; // TODO: Update task API for Hardhat v3
// import "./tasks/lock.js"; // TODO: Update task API for Hardhat v3

// Load environment variables from .env file
dotenvConfig();

// Run 'bunx hardhat vars setup' to see the list of variables that need to be set

// Runtime validation for required environment variables
function validateRequiredVar(name: string, value: string): string {
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set. Run 'bunx hardhat vars setup' to configure.`);
  }
  return value;
}

// Support both mnemonic and private key for deployment
const mnemonic: string | undefined = process.env.MNEMONIC; // TODO: Update for Hardhat v3 vars
const deployerPrivateKey: string | undefined = process.env.DEPLOYER_PRIVATE_KEY; // TODO: Update for Hardhat v3 vars
const infuraApiKey: string = validateRequiredVar("INFURA_API_KEY", process.env.INFURA_API_KEY || ""); // TODO: Update for Hardhat v3 vars

// Validate that either mnemonic or deployer private key is provided
if (!mnemonic && !deployerPrivateKey) {
  throw new Error("Either MNEMONIC or DEPLOYER_PRIVATE_KEY must be set. Run 'bunx hardhat vars setup' to configure.");
}

if (mnemonic && deployerPrivateKey) {
  console.warn("Both MNEMONIC and DEPLOYER_PRIVATE_KEY are set. Using DEPLOYER_PRIVATE_KEY.");
}

// Environment variables for conditional network configuration
const enableForking: boolean = process.env.ENABLE_FORKING === "true";
const CHAIN_ID = process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID) : undefined;

if (enableForking && !isValidChainId(CHAIN_ID)) {
  throw new Error(`CHAIN_ID ${CHAIN_ID} is not supported. Set a valid CHAIN_ID when ENABLE_FORKING=true.`);
}

const forkChain: SupportedChainId | undefined = CHAIN_ID;

if (enableForking && forkChain === AllChainIds.HARDHAT) {
  throw new Error("Cannot fork HARDHAT network. Use a different CHAIN_ID or disable forking.");
}

console.log("Network Mode:", enableForking ? "Forking" : "Pure Hardhat");
if (enableForking && forkChain) {
  console.log("Fork Chain:", chainNames[forkChain], `(${forkChain})`);
}

// Define the common hardforkHistory for all chains
const commonHardforkHistory = {
  london: 1,
};

// Dynamically generate the chains configuration for the Hardhat network
const chainsConfiguration: HardhatNetworkChainsUserConfig = Object.values(AllChainIds)
  .filter((value): value is SupportedChainId => typeof value === "number") // Filter to only include numeric values
  .reduce<HardhatNetworkChainsUserConfig>((chains, chainId) => {
    chains[chainId] = {
      hardforkHistory: commonHardforkHistory,
    };
    return chains;
  }, {});

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  // namedAccounts: { // TODO: Re-enable when hardhat-deploy is compatible with v3
  //   deployer: 0,
  // },
  etherscan: getExplorerConfiguration(),
  gasReporter: {
    currency: "USD",
    enabled: Boolean(process.env.REPORT_GAS),
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    // Generate all supported networks dynamically
    ...getNetworksConfiguration(mnemonic, deployerPrivateKey, infuraApiKey),

    // Special handling for hardhat network with conditional forking
    hardhat: {
      type: 'edr-simulated', // Required for Hardhat v3 - use simulated for both local and forking
      chainsConfiguration, // necessary for functional network forking for some reason?
      accounts: deployerPrivateKey
        ? [
            {
              privateKey: deployerPrivateKey,
              balance: "1000000000000000000000", // 1000 ether
            },
            {
              privateKey: "0x1111111111111111111111111111111111111111111111111111111111111111", // another test account
              balance: "1000000000000000000000", // 1000 ether
            },
          ]
        : { mnemonic: mnemonic! },
      chainId: enableForking ? (forkChain! as number) : (AllChainIds.HARDHAT as number),
      forking: enableForking ? {
        url: getForkChainConfig(forkChain!, infuraApiKey).url,
        blockNumber: getForkChainConfig(forkChain!, infuraApiKey).blockNumber,
        enabled: true
      } : undefined,
    } as HardhatNetworkUserConfig,
  },
  paths: {
    artifacts: "./out", // Use Foundry's output directory
    cache: "./cache_forge", // Use Foundry's cache directory
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.20",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/hardhat-template/issues/31
        // Must match foundry.toml bytecode_hash setting for cross-tool compatibility(particularly contract verification)
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;
