// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.9.0;

import "./Modifiers.sol";
import "../node_modules/@pancakeswap/pancake-swap-lib/contracts/token/BEP20/BEP20.sol";
import "../node_modules/@pancakeswap/pancake-swap-lib/contracts/math/SafeMath.sol";

abstract contract BUSD is BEP20 {
}

contract WTHB is Modifiers, BEP20 {

  address private _busdAddress;
  BUSD private _busdSC;
  uint256 private _wthb2busd;
  uint256 private _counter;
  mapping(address => mapping(uint256 => uint256[])) private _busdBook;
  mapping(address => uint256[]) private _busdShelf;

  event MintFromBUSD(address minter, uint256 bookId, uint256 amount);
  event GetBookEvent(address sender, uint256 bookId);

  constructor(address busdAddr) BEP20("Water Bear - Thai Baht Stable Coin", "wTHB") public {
    _busdSC = BUSD(busdAddr);
    _busdAddress = busdAddr;
    _wthb2busd = 32000000000000000000;
    _counter = 0;
  }

  function mintFromBUSD(uint256 _busdCollateral) public returns(bool success) {
    _busdSC.transferFrom(msg.sender, address(this), _busdCollateral);
    uint256 mintedAmount = _busdCollateral.mul(_wthb2busd).div(1000000000000000000);
    _mint(msg.sender, mintedAmount);
    _counter = _counter + 1;
    _busdBook[msg.sender][_counter].push(_busdCollateral);
    _busdBook[msg.sender][_counter].push(mintedAmount);
    _busdShelf[msg.sender].push(_counter);
    emit MintFromBUSD(msg.sender, _counter, _busdCollateral);
    return true;
  }

  function redeemFromBUSD(uint256 bookId, uint256 wthbReturn) public returns(bool success) {
    uint256[] memory _book = _busdBook[msg.sender][bookId];
    require(_book.length == 2, "Bad book, please contract the team");
    uint256 _collateral = _book[0];
    uint256 _minted = _book[1];

    require(_collateral > 0 && _minted > 0, "This book is inactive");
    require(wthbReturn <= _minted, "Cannot redeem more than minted wTHB");
    
    uint256 fxRate = _collateral.mul(100000).div(_minted);
    uint256 busdRedeem = wthbReturn.mul(fxRate).div(100000);


    transfer(address(this), wthbReturn);
    _burn(address(this), wthbReturn);
    
    _busdSC.transfer(msg.sender, busdRedeem);

    _busdBook[msg.sender][bookId][0] = _collateral.sub(busdRedeem, "redeem amount exceed original amount");
    _busdBook[msg.sender][bookId][1] = _minted.sub(wthbReturn, "minted amount exceed original amount");

    return true;
  }

  function getShelf() public view returns(uint256[] memory) {
    return _busdShelf[msg.sender];
  }

  function getBook(uint256 bookId) public returns(uint256[] memory) {
    
    // emit GetBookEvent(msg.sender, bookId);
    
    return _busdBook[msg.sender][bookId];
  }
}
