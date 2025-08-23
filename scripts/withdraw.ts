import { ethers } from "hardhat";

import { Lock } from "../types";

// =============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// =============================================================================

// Contract address from your deployment
const CONTRACT_ADDRESS = "";

// =============================================================================
// WITHDRAW SCRIPT
// =============================================================================

async function main() {
  console.log("Starting Lock contract withdrawal...");
  console.log("Contract Address:", CONTRACT_ADDRESS);

  if (!CONTRACT_ADDRESS) {
    throw new Error("Please set CONTRACT_ADDRESS in the script");
  }

  // Get the deployer/signer
  const [signer] = await ethers.getSigners();
  console.log("Withdrawing with account:", signer.address);

  // Get contract instance with type safety
  const lock = (await ethers.getContractAt("Lock", CONTRACT_ADDRESS, signer)) as Lock;

  try {
    // Check contract details before withdrawal
    const owner = await lock.owner();
    const unlockTime = await lock.unlockTime();
    const balance = await ethers.provider.getBalance(CONTRACT_ADDRESS);

    console.log("Contract owner:", owner);
    console.log("Unlock time:", new Date(Number(unlockTime) * 1000).toISOString());
    console.log("Contract balance:", ethers.formatEther(balance), "ETH");
    console.log("Current time:", new Date().toISOString());

    // Check if caller is owner
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      throw new Error(`Only the owner (${owner}) can withdraw. Current signer: ${signer.address}`);
    }

    // Check if unlock time has passed
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp < Number(unlockTime)) {
      const timeRemaining = Number(unlockTime) - currentTimestamp;
      throw new Error(`Unlock time not reached. ${timeRemaining} seconds remaining.`);
    }

    if (balance === 0n) {
      console.log("ℹ️  Contract balance is 0, nothing to withdraw");
      return;
    }

    // Perform withdrawal
    console.log("Executing withdrawal...");
    const tx = await lock.withdraw();
    console.log("Transaction hash:", tx.hash);

    // Wait for confirmation
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    if (receipt?.status === 1) {
      console.log("✅ Withdrawal successful!");
      console.log("Gas used:", receipt.gasUsed.toString());

      // Check final balance
      const finalBalance = await ethers.provider.getBalance(CONTRACT_ADDRESS);
      console.log("Final contract balance:", ethers.formatEther(finalBalance), "ETH");
    } else {
      console.log("❌ Transaction failed");
    }
  } catch (error: unknown) {
    console.error("❌ Withdrawal failed:");

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Parse common Lock contract errors
    if (errorMessage.includes("UnlockTimeNotReached")) {
      console.error("The unlock time has not been reached yet");
    } else if (errorMessage.includes("NotOwner")) {
      console.error("Only the contract owner can withdraw");
    } else {
      console.error(errorMessage);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
