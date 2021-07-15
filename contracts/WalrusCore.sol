// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./WTHB.sol";
import "./Fang.sol";
import "../node_modules/@pancakeswap/pancake-swap-lib/contracts/access/Ownable.sol";

contract WalrusCore is Ownable {

  
  address private _fang;

  constructor() public {
  }

  function addCoin(address _address) public onlyOwner returns(bool success) {

  }
}
