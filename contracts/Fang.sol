// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.9.0;

import "./WalrusReward.sol";

contract Fang is WalrusReward {

  constructor(address coreAddr) WalrusReward("Fang", "FANG", coreAddr) public {
  }

}
