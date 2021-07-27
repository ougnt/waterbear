// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.9.0;

import "./WalrusCoin.sol";

contract WJPY is WalrusCoin {
  constructor(uint256 fx, address busdAddr, address coreAddr) 
  WalrusCoin("Walrus - Japanese Yen Stable Coin", "wJPY", fx, busdAddr, coreAddr) public {}
}