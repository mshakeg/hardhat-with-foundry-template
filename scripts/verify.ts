import { run } from "hardhat";

// =============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// =============================================================================

// Contract address from your deployment
const CONTRACT_ADDRESS = "";

// Constructor arguments used during deployment
const UNLOCK_TIME = 0; // Unix timestamp for unlock time

// =============================================================================
// VERIFICATION SCRIPT
// =============================================================================

async function main() {
  console.log("Starting contract verification...");
  console.log("Contract Address:", CONTRACT_ADDRESS);
  console.log("Constructor Args:", [UNLOCK_TIME]);

  try {
    await run("verify:verify", {
      address: CONTRACT_ADDRESS,
      constructorArguments: [UNLOCK_TIME],
    });

    console.log("✅ Contract verified successfully!");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.toLowerCase().includes("already verified")) {
      console.log("ℹ️  Contract is already verified!");
    } else {
      console.error("❌ Verification failed:");
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
