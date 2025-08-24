// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

error InvalidUnlockTime(uint256 unlockTime);
error UnlockTimeNotReached(uint256 unlockTime);

contract Lock {
  uint256 public unlockTime;
  address public owner;

  event Withdrawal(uint256 amount, uint256 when);

  constructor(uint256 _unlockTime) payable {
    if (block.timestamp >= _unlockTime) {
      revert InvalidUnlockTime(_unlockTime);
    }

    unlockTime = _unlockTime;
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Not the owner");
    _;
  }

  function withdraw() public onlyOwner {
    if (block.timestamp < unlockTime) {
      revert UnlockTimeNotReached(unlockTime);
    }

    emit Withdrawal(address(this).balance, block.timestamp);

    payable(owner).transfer(address(this).balance);
  }
}
