// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.9.0;

import "./WalrusCoin.sol";

contract WTHB is WalrusCoin {
  constructor(uint256 fx, address busdAddr, address coreAddr) 
  WalrusCoin("Walrus - Thai Baht Stable Coin", "wTHB", fx, busdAddr, coreAddr) public {}
}