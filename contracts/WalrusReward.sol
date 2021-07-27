// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@pancakeswap/pancake-swap-lib/contracts/token/BEP20/BEP20.sol";
import "../node_modules/@pancakeswap/pancake-swap-lib/contracts/math/SafeMath.sol";

abstract contract WalrusReward is BEP20 {
  address public coreAddr;

  constructor(string memory name, string memory symbol, address _coreAddr) BEP20(name, symbol) public {
    coreAddr = _coreAddr;
  }

  function walrus() public pure returns(bool success) {
    return true;
  }

  function distributeReward(address to, uint256 amount) public returns(bool success) {
    require(msg.sender == coreAddr, "Fang: Only the core contract can call this function.");
    _mint(to, amount);
    return true;
  }
}
