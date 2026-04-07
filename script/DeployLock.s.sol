// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { Lock } from "../contracts/Lock.sol";

/**
 * @title DeployLock
 * @dev Foundry deployment script for Lock contract
 *
 * Security: This script uses Cast wallet accounts (--account flag) instead of private keys in .env
 *
 * The Lock contract accepts:
 * - _unlockTime: Unix timestamp when funds can be withdrawn
 * - msg.value: Amount of ETH to lock in the contract
 *
 * Usage:
 *   forge script script/DeployLock.s.sol:DeployLock \
 *     --rpc-url <network> --sender <wallet_address> --account <wallet_name> --broadcast
 *
 * Example:
 *   forge script script/DeployLock.s.sol:DeployLock \
 *     --rpc-url sepolia --sender 0x123... --account testnet --broadcast
 *
 */
contract DeployLock is Script {
  // ============ Deployment Results ============
  struct DeploymentResult {
    address lockContract;
    address deployer;
    uint256 unlockTime;
    uint256 lockedAmount;
    uint256 chainId;
  }

  function run() external returns (DeploymentResult memory result) {
    // Get deployment parameters
    uint256 unlockTime = block.timestamp + 365 days; // 1 year from now
    uint256 lockedAmount = 0.001 ether; // Default amount to lock

    // Log deployment configuration
    console.log("=== Deployment Configuration ===");
    console.log("Chain ID:", block.chainid);
    console.log("Contract: Lock");
    console.log("Unlock time:", unlockTime);
    console.log("Locked amount (wei):", lockedAmount);
    console.log("Locked amount (ETH):", lockedAmount / 1e18);
    console.log("================================");

    // Deploy contract
    address deployedLock = _deployLock(unlockTime, lockedAmount);

    // Prepare result
    result = DeploymentResult({
      lockContract: deployedLock,
      deployer: msg.sender,
      unlockTime: unlockTime,
      lockedAmount: lockedAmount,
      chainId: block.chainid
    });

    // Log deployment results
    _logDeploymentResults(result);

    console.log("Deployment completed successfully!");

    return result;
  }

  function _deployLock(uint256 unlockTime, uint256 lockedAmount) internal returns (address) {
    console.log("Deployer:", msg.sender);
    console.log("Starting Lock deployment...");

    vm.startBroadcast();

    Lock lock = new Lock{ value: lockedAmount }(unlockTime);

    vm.stopBroadcast();

    console.log("Lock deployed at:", address(lock));
    console.log("Lock owner:", lock.owner());
    return address(lock);
  }

  function _logDeploymentResults(DeploymentResult memory result) internal pure {
    console.log("\n=== Deployment Results ===");
    console.log("Lock Contract:", result.lockContract);
    console.log("Deployer:", result.deployer);
    console.log("Unlock Time:", result.unlockTime);
    console.log("Locked Amount:", result.lockedAmount);
    console.log("Chain ID:", result.chainId);
    console.log("==========================\n");
  }
}
