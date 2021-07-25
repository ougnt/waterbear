const Exceptions = require('./exceptions.js');
const WTHB = artifacts.require("WTHB");
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
  let fang;
  let busd;
  let coins;

  it("should be able to deploy", async function () {
    await Fang.deployed().then(fangInst => fang = fangInst);
    await WalrusCore.deployed().then(inst => walrus = inst);
    await WTHB.deployed().then(inst => wthb = inst);
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

  it("can update the exchange rate of its coin", async function() {
    await walrus.updateExchangeRate(coins[0], '33000000000000000000', fang.address, {from: accounts[0]})
    await walrus.getExchangeRate.call(coins[0], {from: accounts[0]}).then( fx => assert.equal(fx, '33000000000000000000'))
    await wthb.exchangeRate.call({from: accounts[2]}).then( fx => assert.equal(fx, '33000000000000000000'))
    // TODO : Check that Fang is distributed
  })
});
