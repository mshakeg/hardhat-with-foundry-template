// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

error InvalidUnlockTime(uint256 unlockTime);
error UnlockTimeNotReached(uint256 unlockTime);

contract Lock is Ownable {
  uint256 public unlockTime;

  event Withdrawal(uint256 amount, uint256 when);

  constructor(uint256 _unlockTime) payable Ownable(msg.sender) {
    if (block.timestamp >= _unlockTime) {
      revert InvalidUnlockTime(_unlockTime);
    }

    unlockTime = _unlockTime;
  }

  function withdraw() public onlyOwner {
    if (block.timestamp < unlockTime) {
      revert UnlockTimeNotReached(unlockTime);
    }

    emit Withdrawal(address(this).balance, block.timestamp);

    payable(owner()).transfer(address(this).balance);
  }
}
