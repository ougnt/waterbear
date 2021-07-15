// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./WalrusCoin.sol";
import "./Fang.sol";
import "../node_modules/@pancakeswap/pancake-swap-lib/contracts/access/Ownable.sol";

contract WalrusCore is Ownable {
  address private _fang;
  address[] private _availableCoinsAddrs;

  constructor() public {
  }

  function addCoin(address _address) public onlyOwner returns(bool success) {
    _availableCoinsAddrs.push(_address);
    return true;
  }

  function getCoins() public view returns(address[] memory) {
    return _availableCoinsAddrs;
  }

  function updateExchangeRate(address coinAddr, uint256 rate) public returns(bool success) {
    WalrusCoin coin = WalrusCoin(coinAddr);
    coin.updateExchangeRate(rate, msg.sender);
    return true;
  }
}
