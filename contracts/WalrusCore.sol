// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./WalrusCoin.sol";
import "../node_modules/@pancakeswap/pancake-swap-lib/contracts/access/Ownable.sol";

contract WalrusCore is Ownable {
  address private _fang;
  address[] private _availableCoinsAddrs;
  
  event UpdateExchangeRateEvent(address coinAddr, uint256 rate);

  constructor(address fangAddr) public {
  }

  function addCoin(address _address) public onlyOwner returns(bool success) {
    WalrusCoin _coin = WalrusCoin(_address);
    require(_coin.walrus(), "Walrus: Not support coin");
    _availableCoinsAddrs.push(_address);
    return true;
  }

  function getCoins() public view returns(address[] memory) {
    return _availableCoinsAddrs;
  }

  function getExchangeRate(address coinAddr) public returns(uint256) {
    return WalrusCoin(coinAddr).exchangeRate();
  }

  function updateExchangeRate(address coinAddr, uint256 rate) public onlyOwner returns(bool success) {
    emit UpdateExchangeRateEvent(coinAddr, rate);
    WalrusCoin(coinAddr).updateExchangeRate(rate, msg.sender);  
    return true;
  }
}
