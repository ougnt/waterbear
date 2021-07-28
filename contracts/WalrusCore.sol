// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./WalrusCoin.sol";
import "./WalrusReward.sol";
import "../node_modules/@pancakeswap/pancake-swap-lib/contracts/access/Ownable.sol";
import "../node_modules/@pancakeswap/pancake-swap-lib/contracts/math/SafeMath.sol";

contract WalrusCore is Ownable {
  using SafeMath for uint256;

  address[] private _availableCoinsAddrs;
  mapping(address => uint256) public rewardAllo;
  uint256 public rewardPerBlock;
  uint256 public totalAllocation;
  
  event RewardDistribute(address to, uint256 amount);

  constructor() public {
    rewardPerBlock = 1000000000000000000;
    totalAllocation = 0;
  }

  function addCoin(address _address, uint256 _rewardAllo) public onlyOwner returns(bool success) {
    WalrusCoin _coin = WalrusCoin(_address);
    require(_coin.walrus(), "Walrus: Not support coin");
    _availableCoinsAddrs.push(_address);
    rewardAllo[_address] = _rewardAllo;
    totalAllocation += _rewardAllo;
    return true;
  }

  function updateRewardAllocation(address coinAddress, uint256 newAllocation) public onlyOwner returns(bool success) {
    totalAllocation -= rewardAllo[coinAddress];
    totalAllocation += newAllocation;
    rewardAllo[coinAddress] = newAllocation;
    return true;
  }

  function getCoins() public view returns(address[] memory) {
    return _availableCoinsAddrs;
  }

  function getExchangeRate(address coinAddr) public returns(uint256) {
    return WalrusCoin(coinAddr).exchangeRate();
  }

  function updateExchangeRate(address coinAddr, uint256 rate, address walrusRewardAddr, address updater) public onlyOwner returns(bool success) {
    
    uint256 rewardAmount = pendingReward(coinAddr);
    WalrusCoin(coinAddr).updateExchangeRate(rate);

    WalrusReward reward = WalrusReward(walrusRewardAddr);
    reward.walrus();
    WalrusReward(walrusRewardAddr).distributeReward(updater, rewardAmount);

    emit RewardDistribute(updater, rewardAmount);

    return true;
  }

  function getMultiplier(uint256 _from, uint256 _to) private view returns (uint256) {
    return _to.sub(_from);
  }

  function pendingReward(address coinAddr) public view returns(uint256 fangReward) {
    WalrusCoin coin = WalrusCoin(coinAddr);
    uint256 multiplier = getMultiplier(coin.lastUpdateBlock(), block.number);
    uint256 rewardAllocation = rewardAllo[coinAddr];
    fangReward = rewardPerBlock.mul(multiplier).mul(rewardAllocation).div(totalAllocation);
  }
}
