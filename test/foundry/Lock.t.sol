// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";
import { Lock, InvalidUnlockTime, UnlockTimeNotReached } from "../../contracts/Lock.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract LockTest is Test {
  Lock public lock;
  address public owner;
  address public otherAccount;
  uint256 public unlockTime;
  uint256 public lockedAmount = 1 ether;

  // Event declaration for testing
  event Withdrawal(uint256 amount, uint256 when);

  function setUp() public {
    owner = address(this);
    otherAccount = address(0x1);
    unlockTime = block.timestamp + 365 days; // 1 year from now

    // Deploy Lock contract with locked funds
    lock = new Lock{ value: lockedAmount }(unlockTime);
  }

  // ========== DEPLOYMENT TESTS ==========

  function test_RevertIf_UnlockTimeNotInFuture() public {
    // Should fail if unlockTime is not in the future
    uint256 pastTime = block.timestamp - 1;

    vm.expectRevert(abi.encodeWithSelector(InvalidUnlockTime.selector, pastTime));
    new Lock{ value: 1 ether }(pastTime);
  }

  function test_SetRightUnlockTime() public view {
    // Should set the right unlockTime
    assertEq(lock.unlockTime(), unlockTime);
  }

  function test_SetRightOwner() public view {
    // Should set the right owner
    assertEq(lock.owner(), owner);
  }

  function test_ReceiveAndStoreFunds() public view {
    // Should receive and store the funds to lock
    assertEq(address(lock).balance, lockedAmount);
  }

  // ========== WITHDRAWAL VALIDATION TESTS ==========

  function test_RevertIf_CalledTooSoon() public {
    // Should revert with the right error if called too soon
    vm.expectRevert(abi.encodeWithSelector(UnlockTimeNotReached.selector, unlockTime));
    lock.withdraw();
  }

  function test_RevertIf_CalledFromAnotherAccount() public {
    // Should revert with the right error if called from another account

    // Fast forward to unlock time
    vm.warp(unlockTime);

    // Switch to other account
    vm.prank(otherAccount);
    // OpenZeppelin's OwnableUnauthorizedAccount error
    vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, otherAccount));
    lock.withdraw();
  }

  function test_SuccessfulWithdrawal() public {
    // Shouldn't fail if the unlockTime has arrived and the owner calls it

    // Fast forward to unlock time
    vm.warp(unlockTime);

    // Should not revert
    lock.withdraw();
  }

  // ========== EVENT TESTS ==========

  function test_EmitWithdrawalEvent() public {
    // Should emit an event on withdrawals

    // Fast forward to unlock time
    vm.warp(unlockTime);

    // Expect the Withdrawal event
    vm.expectEmit(true, true, true, true);
    emit Withdrawal(lockedAmount, unlockTime);

    lock.withdraw();
  }

  // ========== TRANSFER TESTS ==========

  function test_TransferFundsToOwner() public {
    // Should transfer the funds to the owner

    uint256 ownerInitialBalance = address(owner).balance;
    uint256 contractInitialBalance = address(lock).balance;

    // Fast forward to unlock time
    vm.warp(unlockTime);

    // Withdraw funds
    lock.withdraw();

    // Check balances
    assertEq(address(owner).balance, ownerInitialBalance + lockedAmount);
    assertEq(address(lock).balance, 0);

    // Verify the exact change
    assertEq(address(lock).balance, contractInitialBalance - lockedAmount);
  }

  // ========== FUZZ TESTS (Foundry Specific) ==========

  function testFuzz_ValidUnlockTime(uint256 futureTime) public {
    // Fuzz test: any time in the future should work

    // Bound the fuzz input to reasonable future times
    futureTime = bound(futureTime, block.timestamp + 1, block.timestamp + 100 * 365 days);

    // Should successfully deploy with any valid future time
    Lock testLock = new Lock{ value: 1 ether }(futureTime);

    assertEq(testLock.unlockTime(), futureTime);
    assertEq(testLock.owner(), address(this));
  }

  function testFuzz_InvalidUnlockTime(uint256 pastTime) public {
    // Fuzz test: any time in the past should fail

    // Bound the fuzz input to past times
    pastTime = bound(pastTime, 0, block.timestamp);

    vm.expectRevert(abi.encodeWithSelector(InvalidUnlockTime.selector, pastTime));
    new Lock{ value: 1 ether }(pastTime);
  }

  // ========== GAS BENCHMARKING ==========

  function test_GasBenchmark_Deployment() public {
    uint256 gasBefore = gasleft();
    new Lock{ value: 1 ether }(block.timestamp + 365 days);
    uint256 gasUsed = gasBefore - gasleft();

    console.log("Gas used for deployment:", gasUsed);

    // Assert gas usage is reasonable (adjusted for OpenZeppelin Ownable)
    assertLt(gasUsed, 250_000);
  }

  function test_GasBenchmark_Withdrawal() public {
    vm.warp(unlockTime);

    uint256 gasBefore = gasleft();
    lock.withdraw();
    uint256 gasUsed = gasBefore - gasleft();

    console.log("Gas used for withdrawal:", gasUsed);

    // Assert gas usage is reasonable
    assertLt(gasUsed, 50_000);
  }

  // Helper function to receive Ether (needed for balance checks)
  receive() external payable { }
}
