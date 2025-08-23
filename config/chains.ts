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

export const AllChainIds = {
  ...MainnetChainId,
  ...TestnetChainId,
  ...LocalChainId,
} as const;

export type SupportedChainId = MainnetChainId | TestnetChainId | LocalChainId;

export function isValidChainId(value: number | undefined): value is SupportedChainId {
  return value !== undefined && Object.values(AllChainIds).includes(value as SupportedChainId);
}

export const SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(AllChainIds).filter(
  (value): value is number => typeof value === "number",
);

// Chain names mapping for network configuration
export const chainNames: Record<SupportedChainId, string> = {
  [AllChainIds.ETHEREUM_MAINNET]: "mainnet",
  [AllChainIds.POLYGON_MAINNET]: "polygon-mainnet",
  [AllChainIds.SEPOLIA]: "sepolia",
  [AllChainIds.HARDHAT]: "hardhat",
  [AllChainIds.GANACHE]: "ganache",
} as const;

// Public RPC URLs
export const customRpcUrls: Record<SupportedChainId, string> = {
  [AllChainIds.ETHEREUM_MAINNET]: "https://1rpc.io/eth",
  [AllChainIds.POLYGON_MAINNET]: "https://1rpc.io/matic",
  [AllChainIds.SEPOLIA]: "https://0xrpc.io/sep",
  [AllChainIds.GANACHE]: "http://localhost:8545",
  [AllChainIds.HARDHAT]: "",
} as const;

// Chains that support Infura
export const infuraSupportedChains: Set<SupportedChainId> = new Set([
  AllChainIds.ETHEREUM_MAINNET,
  AllChainIds.POLYGON_MAINNET,
  AllChainIds.SEPOLIA,
]);
