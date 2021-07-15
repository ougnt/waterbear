// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.9.0;

import "./WalrusCoin.sol";

contract WTHB is WalrusCoin {
  constructor(address busdAddr) 
  WalrusCoin("Walrus - Thai Baht Stable Coin", "wTHB", 32000000000000000000, busdAddr) public {}
}