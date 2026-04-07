/**
 * Network Detection Helpers for Hardhat Tests
 *
 * Utilities to detect the runtime environment and conditionally
 * execute test logic based on the active network.
 */
import { network } from "hardhat";
import { ethers } from "hardhat";

import { AllChainIds } from "./chains";

/**
 * Gets the active chain ID from the provider
 */
export async function getActiveChainId(): Promise<number> {
  const net = await ethers.provider.getNetwork();
  return Number(net.chainId);
}

/**
 * Checks if we're running on the Hardhat network (by network name)
 */
export function isNetworkHardhat(): boolean {
  return network.name === "hardhat";
}

/**
 * Checks if we're running on hedera-local network (by network name)
 */
export function isNetworkHederaLocal(): boolean {
  return network.name === "hedera-local";
}

/**
 * Checks if we're on a "pure" Hardhat node (not forking any network)
 * Pure Hardhat means: network.name === "hardhat" AND chainId === 31337
 */
export async function isPureHardhatNode(): Promise<boolean> {
  if (!isNetworkHardhat()) {
    return false;
  }
  const chainId = await getActiveChainId();
  return chainId === AllChainIds.HARDHAT;
}

/**
 * Checks if we're on a forked Hardhat network
 * This is true when: network.name === "hardhat" AND chainId !== 31337
 */
export async function isHardhatFork(): Promise<boolean> {
  if (!isNetworkHardhat()) {
    return false;
  }
  const chainId = await getActiveChainId();
  return chainId !== AllChainIds.HARDHAT;
}

/**
 * Checks if we're on a "live" network (not pure Hardhat)
 */
export async function isLiveNetwork(): Promise<boolean> {
  return !isNetworkHardhat();
}

/**
 * Gets a human-readable description of the current network
 */
export async function getNetworkDescription(): Promise<string> {
  const chainId = await getActiveChainId();
  const name = network.name;

  if (await isPureHardhatNode()) {
    return `Pure Hardhat (${name}, chainId: ${chainId})`;
  } else if (await isHardhatFork()) {
    return `Hardhat Fork (${name}, chainId: ${chainId})`;
  } else {
    return `Live Network (${name}, chainId: ${chainId})`;
  }
}
