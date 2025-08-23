import { vars } from "hardhat/config";

import { SupportedChainId, chainNames } from "./chains";

// Explorer provider system interfaces
type ExplorerType = "etherscan-v2" | "blockscout" | "routescan";

interface ExplorerProvider {
  type: ExplorerType;
  name: string;
  baseURL: string;
  apiKeyVar?: string;
  supportedChains: SupportedChainId[];
  requiresApiKey: boolean;
}

interface ChainExplorerConfig {
  network: string;
  chainId: number;
  urls: {
    apiURL: string;
    browserURL: string;
  };
}

// Explorer provider definitions
const explorerProviders: Record<string, ExplorerProvider> = {
  etherscanV2: {
    type: "etherscan-v2",
    name: "Etherscan V2",
    baseURL: "https://api.etherscan.io/v2/api",
    apiKeyVar: "ETHERSCAN_API_KEY",
    supportedChains: [
      SupportedChainId.ETHEREUM_MAINNET,
      SupportedChainId.POLYGON_MAINNET,
      SupportedChainId.SEPOLIA,
      // Etherscan v2 now supports multiple chains with single API
    ],
    requiresApiKey: true,
  },
} as const;

// Chain-to-explorer mapping with fallbacks
const chainExplorerMapping: Record<SupportedChainId, string[]> = {
  [SupportedChainId.ETHEREUM_MAINNET]: ["etherscanV2"],
  [SupportedChainId.POLYGON_MAINNET]: ["etherscanV2"],
  [SupportedChainId.SEPOLIA]: ["etherscanV2"],
  [SupportedChainId.HARDHAT]: [],
  [SupportedChainId.GANACHE]: [],
} as const;

// Generate explorer URLs for a chain
function getExplorerConfig(chainId: SupportedChainId): ChainExplorerConfig | null {
  const providerKeys = chainExplorerMapping[chainId];
  if (!providerKeys.length) return null;

  // Use first available provider for now (easily extensible to fallbacks later)
  const providerKey = providerKeys[0];
  const provider = explorerProviders[providerKey];

  switch (provider.type) {
    case "etherscan-v2":
      return {
        network: chainNames[chainId],
        chainId,
        urls: {
          apiURL: `${provider.baseURL}?chainid=${chainId}`,
          browserURL: getEtherscanV2BrowserURL(chainId),
        },
      };
    default:
      return null;
  }
}

function getEtherscanV2BrowserURL(chainId: SupportedChainId): string {
  switch (chainId) {
    case SupportedChainId.ETHEREUM_MAINNET:
      return "https://etherscan.io";
    case SupportedChainId.SEPOLIA:
      return "https://sepolia.etherscan.io";
    case SupportedChainId.POLYGON_MAINNET:
      return "https://polygonscan.com";
    default:
      return "https://etherscan.io";
  }
}

// Generate API keys for all chains (using network names as keys for hardhat-verify compatibility)
const explorerApiKeys: Record<string, string> = Object.entries(chainNames).reduce(
  (keys, [chainIdString, networkName]) => {
    const chainId = Number(chainIdString) as SupportedChainId;
    const providerKeys = chainExplorerMapping[chainId];

    if (providerKeys.length > 0) {
      const provider = explorerProviders[providerKeys[0]];
      if (provider.requiresApiKey && provider.apiKeyVar) {
        keys[networkName] = vars.get(provider.apiKeyVar, "");
      } else {
        keys[networkName] = "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"; // Dummy key for non-requiring APIs
      }
    } else {
      keys[networkName] = "";
    }

    return keys;
  },
  {} as Record<string, string>,
);

// Generate custom chains array for hardhat-verify
const customChainsArray: ChainExplorerConfig[] = Object.values(SupportedChainId)
  .filter((chainId): chainId is number => typeof chainId === "number")
  .map((chainId) => getExplorerConfig(chainId as SupportedChainId))
  .filter((config): config is ChainExplorerConfig => config !== null)
  .filter((_config) => {
    // Only include chains that need custom configuration (not default supported by hardhat-verify)
    // Currently no chains need custom config as we only use Etherscan v2 which is natively supported
    return false;
  });

// Export the complete explorer configuration for hardhat
export function getExplorerConfiguration() {
  return {
    apiKey: explorerApiKeys,
    customChains: customChainsArray,
  };
}

// Export types for external use
export type { ChainExplorerConfig, ExplorerProvider };
