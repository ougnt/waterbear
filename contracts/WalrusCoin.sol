// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@pancakeswap/pancake-swap-lib/contracts/token/BEP20/BEP20.sol";
import "../node_modules/@pancakeswap/pancake-swap-lib/contracts/math/SafeMath.sol";

abstract contract BUSD is BEP20 {}

abstract contract WalrusCoin is BEP20 {
  uint256 private _busdFx;
  uint256 private _lastUpdateBlock;
  uint256 private _counter;
  BUSD private _busdSC;
  address public coreAddr;
  mapping(address => mapping(uint256 => uint256[])) private _busdBook;
  mapping(address => uint256[]) private _busdShelf;
  
  event MintFromBUSD(address minter, uint256 bookId, uint256 amount);

  constructor(string memory _name, string memory _symbol, uint256 busdFx, address _busdAddr, address _coreAddr) 
  BEP20(_name, _symbol) public {
    _busdFx = busdFx;
    _busdSC = BUSD(_busdAddr);
    _lastUpdateBlock = block.number;
    _counter = 0;
    coreAddr = _coreAddr;
  }

  function walrus() public pure returns(bool success) {
    return true;
  }

  function updateExchangeRate(uint256 rate, address updater) public returns(bool success) {
    require(msg.sender == coreAddr, "WalrusCoin: Only the core contract can call this function.");
    _busdFx = rate;
    return true;
  }

  function exchangeRate() public view returns(uint256 rate) {
    rate = _busdFx;
  }

  function mintFromBUSD(uint256 _busdCollateral) public returns(bool success) {
    _busdSC.transferFrom(msg.sender, address(this), _busdCollateral);
    uint256 mintedAmount = _busdCollateral.mul(_busdFx).div(1000000000000000000);
    _mint(msg.sender, mintedAmount);
    _counter = _counter + 1;
    _busdBook[msg.sender][_counter].push(_busdCollateral);
    _busdBook[msg.sender][_counter].push(mintedAmount);
    _busdShelf[msg.sender].push(_counter);
    emit MintFromBUSD(msg.sender, _counter, _busdCollateral);
    return true;
  }

  function redeemFromBUSD(uint256 bookId, uint256 coinReturn) public returns(bool success) {
    uint256[] memory _book = _busdBook[msg.sender][bookId];
    require(_book.length == 2, "Bad book, please contract the team");
    uint256 _collateral = _book[0];
    uint256 _minted = _book[1];

    require(_collateral > 0 && _minted > 0, "This book is inactive");
    require(coinReturn <= _minted, "Cannot redeem more than minted wTHB");
    
    uint256 fxRate = _collateral.mul(100000).div(_minted);
    uint256 busdRedeem = coinReturn.mul(fxRate).div(100000);


    transfer(address(this), coinReturn);
    _burn(address(this), coinReturn);
    
    _busdSC.transfer(msg.sender, busdRedeem);

    _busdBook[msg.sender][bookId][0] = _collateral.sub(busdRedeem, "redeem amount exceed original amount");
    _busdBook[msg.sender][bookId][1] = _minted.sub(coinReturn, "minted amount exceed original amount");

    return true;
  }

  function getShelf() public view returns(uint256[] memory) {
    return _busdShelf[msg.sender];
  }

  function getBook(uint256 bookId) public view returns(uint256[] memory) {
    
    return _busdBook[msg.sender][bookId];
  }
}
