const Exceptions = require('./exceptions.js');
const TimeHelper = require('./TimeHelper.js')
const WTHB = artifacts.require("WTHB");
const WJPY = artifacts.require("WJPY");
const WalrusCore = artifacts.require("WalrusCore");
const Fang = artifacts.require("Fang");
let NETWORK = process.env.NETWORK;
let FakeBUSD;

if (NETWORK === 'development') {
  FakeBUSD = artifacts.require("FakeBUSD");
}
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Walrus", function (accounts) {

  let walrus;
  let wthb;
  let wjpy;
  let fang;
  let busd;
  let coins;

  it("should be able to deploy", async function () {
    await Fang.deployed().then(fangInst => fang = fangInst);
    await WalrusCore.deployed().then(inst => walrus = inst);
    await WTHB.deployed().then(inst => wthb = inst);
    await WJPY.deployed().then(inst => wjpy = inst);
    await FakeBUSD.deployed().then(inst => busd = inst);
    assert.equal(await fang.balanceOf.call(accounts[0]).valueOf(), 0)
    assert.equal(await fang.balanceOf.call(accounts[1]).valueOf(), 0)
    assert.equal(await fang.balanceOf.call(accounts[2]).valueOf(), 0)
  });

  it("should allow only owner to add walrus coin", async function(){
    await Exceptions.tryCatch(walrus.addCoin(wthb.address, 1, {from: accounts[1]}), 'revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.');
  })

  it("should be able to add Walrus Coin to the system", async function() {
    await walrus.addCoin(wthb.address, 1, {from: accounts[0]})
    
    coins = await walrus.getCoins.call({from: accounts[1]})
    assert.equal(coins.length, 1)
    assert.equal(coins[0], wthb.address)
  })

  it("should not be able to add none Walrus Coin to the system", async function() {
    await Exceptions.tryCatch(walrus.addCoin(busd.address, 1, {from: accounts[0]}), 'revert');
  })

  it("can update the exchange rate of its coin and get reward", async function() {
    await fang.balanceOf(accounts[5]).then(bal => assert.equal(bal, 0))
    
    let after;
    let before;

    await wthb.lastUpdateBlock.call().then(num => {before = num.toNumber()})
    await TimeHelper.advanceBlock();
    await web3.eth.getBlockNumber((er, re) => {after = re})
    let expectedReward = new web3.utils.BN((after - before ) + '000000000000000000')
    await walrus.pendingReward.call(coins[0], {from: accounts[5]}).then( pending => assert.equal( expectedReward.toString(), pending.toString()))
    await walrus.updateExchangeRate(coins[0], '33000000000000000000', fang.address, accounts[5], {from: accounts[0]})
    await walrus.getExchangeRate.call(coins[0], {from: accounts[0]}).then( fx => assert.equal(fx, '33000000000000000000'))
    await wthb.exchangeRate.call({from: accounts[2]}).then( fx => assert.equal(fx, '33000000000000000000'))
    await web3.eth.getBlockNumber((er, re) => after = re)
    expectedReward = new web3.utils.BN((after - before ) + '000000000000000000')
    await fang.balanceOf(accounts[5]).then(bal => assert.equal(bal, expectedReward.toString()))

    await walrus.pendingReward.call(coins[0], {from: accounts[5]}).then( pending => assert.equal( "0", pending.toString()))
  })

  it("should be able to add another Walrus Coin to the system", async function() {
    await walrus.addCoin(wjpy.address, 1, {from: accounts[0]})
    
    coins = await walrus.getCoins.call({from: accounts[1]})
    assert.equal(coins.length, 2)
    assert.equal(coins[0], wthb.address)
    assert.equal(coins[1], wjpy.address)
  })

  it("should allow only the account owner update the reward allocation", async function() {
    await Exceptions.tryCatch(walrus.updateRewardAllocation(wthb.address, 2, {from: accounts[1]}), 'revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.');
  })
  
  it("should be able to update the reward distribution", async function() {
    let wthbRate = await walrus.rewardAllo.call(wthb.address, {from: accounts[2]})
    let wjpyRate = await walrus.rewardAllo.call(wjpy.address, {from: accounts[2]})
    assert.equal(wthbRate, 1)
    assert.equal(wjpyRate, 1)

    await walrus.updateRewardAllocation(wthb.address, 3, {from: accounts[0]})
    wthbRate = await walrus.rewardAllo.call(wthb.address, {from: accounts[2]})
    wjpyRate = await walrus.rewardAllo.call(wjpy.address, {from: accounts[2]})
    let totalAllocation = await walrus.totalAllocation.call({from:accounts[2]})
    assert.equal(wthbRate, 3)
    assert.equal(wjpyRate, 1)
    assert.equal(totalAllocation, 4)
  })

  it("should divide the reward according to the reward allocation", async function() {
    let after;
    let before;

    await wthb.lastUpdateBlock.call().then(num => {before = num.toNumber()})
    await TimeHelper.advanceBlock();
    await web3.eth.getBlockNumber((er, re) => {after = re})
    let expectedReward = new web3.utils.BN((after - before) + '000000000000000000').mul(new web3.utils.BN(3)).div(new web3.utils.BN(4))
    await walrus.pendingReward.call(coins[0], {from: accounts[6]}).then( pending => assert.equal( expectedReward.toString(), pending.toString()))
    
    await wjpy.lastUpdateBlock.call().then(num => {before = num.toNumber()})
    await TimeHelper.advanceBlock();
    await web3.eth.getBlockNumber((er, re) => {after = re})
    expectedReward = new web3.utils.BN((after - before ) + '000000000000000000').div(new web3.utils.BN(4))
    await walrus.pendingReward.call(coins[1], {from: accounts[6]}).then( pending => assert.equal( expectedReward.toString(), pending.toString()))
  })
});
