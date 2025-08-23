import type { NetworkUserConfig } from "hardhat/types";

import {
  AllChainIds,
  SupportedChainId,
  chainNames,
  customRpcUrls,
  infuraSupportedChains,
  isValidChainId,
} from "./chains";

// Fork block numbers to block pin at (optional)
const forkBlockNumbers: Partial<Record<SupportedChainId, number>> = {
  // [SupportedChainId.ETHEREUM_MAINNET]: 19_411_400,
  // [SupportedChainId.POLYGON_MAINNET]: 56_544_820,
} as const;

function getForkChainBlockNumber(chainId: SupportedChainId): number | undefined {
  return forkBlockNumbers[chainId];
}

function getChainUrl(chainId: SupportedChainId, infuraApiKey: string): string {
  // Check if the chain has a custom RPC URL
  if (customRpcUrls[chainId]) {
    return customRpcUrls[chainId]!;
  }

  // Use Infura for supported chains
  if (infuraSupportedChains.has(chainId)) {
    const networkName = chainNames[chainId].replace("-mainnet", "").replace("-testnet", "");
    return `https://${networkName}.infura.io/v3/${infuraApiKey}`;
  }

  throw new Error(`No RPC URL configured for chain ${chainId}`);
}

function getChainConfig(
  chainId: SupportedChainId,
  mnemonic: string | undefined,
  deployerPrivateKey: string | undefined,
  infuraApiKey: string,
): NetworkUserConfig {
  const jsonRpcUrl = getChainUrl(chainId, infuraApiKey);

  // Use private key if provided, otherwise use mnemonic
  const accounts = deployerPrivateKey
    ? [deployerPrivateKey]
    : {
        count: 10,
        mnemonic: mnemonic!,
        path: "m/44'/60'/0'/0",
      };

  return {
    accounts,
    chainId: chainId as number, // Cast SupportedChainId to number for Hardhat compatibility
    url: jsonRpcUrl,
    timeout: 60_000, // Hedera networks may need longer timeout
  };
}

function getForkChainConfig(
  chainId: SupportedChainId,
  infuraApiKey: string,
): {
  url: string;
  blockNumber?: number;
} {
  const jsonRpcUrl = getChainUrl(chainId, infuraApiKey);
  const blockNumber = getForkChainBlockNumber(chainId);

  return {
    url: jsonRpcUrl,
    blockNumber,
  };
}

// Generate networks configuration for hardhat
export function getNetworksConfiguration(
  mnemonic: string | undefined,
  deployerPrivateKey: string | undefined,
  infuraApiKey: string,
) {
  // Generate all supported networks dynamically
  const networks = Object.entries(chainNames).reduce(
    (networks, [chainIdString, networkName]) => {
      const chainId = Number(chainIdString);
      if (isValidChainId(chainId) && chainId !== AllChainIds.HARDHAT && chainId !== AllChainIds.GANACHE) {
        networks[networkName] = getChainConfig(chainId as SupportedChainId, mnemonic, deployerPrivateKey, infuraApiKey);
      }
      return networks;
    },
    {} as Record<string, NetworkUserConfig>,
  );

  // Add Ganache local network
  networks.ganache = getChainConfig(AllChainIds.GANACHE, mnemonic, deployerPrivateKey, infuraApiKey);

  return networks;
}

// Export fork configuration helper
export { getForkChainConfig };
