// Mainnet chains
export enum MainnetChainId {
  ETHEREUM_MAINNET = 1,
  POLYGON_MAINNET = 137,
}

// Testnet chains
export enum TestnetChainId {
  SEPOLIA = 11155111,
}

// Local/Development chains
export enum LocalChainId {
  HARDHAT = 31337,
  GANACHE = 1337,
}

export const SupportedChainId = {
  ...MainnetChainId,
  ...TestnetChainId,
  ...LocalChainId,
} as const;

export type SupportedChainId = MainnetChainId | TestnetChainId | LocalChainId;

export function isValidChainId(value: number | undefined): value is SupportedChainId {
  return value !== undefined && Object.values(SupportedChainId).includes(value as SupportedChainId);
}

export const SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (value): value is number => typeof value === "number",
);

// Chain names mapping for network configuration
export const chainNames: Record<SupportedChainId, string> = {
  [SupportedChainId.ETHEREUM_MAINNET]: "mainnet",
  [SupportedChainId.POLYGON_MAINNET]: "polygon-mainnet",
  [SupportedChainId.SEPOLIA]: "sepolia",
  [SupportedChainId.HARDHAT]: "hardhat",
  [SupportedChainId.GANACHE]: "ganache",
} as const;

// Public RPC URLs
export const customRpcUrls: Record<SupportedChainId, string> = {
  [SupportedChainId.ETHEREUM_MAINNET]: "https://1rpc.io/eth",
  [SupportedChainId.POLYGON_MAINNET]: "https://1rpc.io/matic",
  [SupportedChainId.SEPOLIA]: "https://0xrpc.io/sep",
  [SupportedChainId.GANACHE]: "http://localhost:8545",
  [SupportedChainId.HARDHAT]: "",
} as const;

// Chains that support Infura
export const infuraSupportedChains: Set<SupportedChainId> = new Set([
  SupportedChainId.ETHEREUM_MAINNET,
  SupportedChainId.POLYGON_MAINNET,
  SupportedChainId.SEPOLIA,
]);
