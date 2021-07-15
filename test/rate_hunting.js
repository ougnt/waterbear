const Exceptions = require('./exceptions.js');
const WTHB = artifacts.require("WTHB");
const WalrusCore = artifacts.require("WalrusCore");
//let NETWORK = process.env.NETWORK;

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Walrus", function (accounts) {

  let walrus;
  let wthb;

  it("should be able to deploy", async function () {

    await WalrusCore.deployed().then(inst => walrus = inst);
    await WTHB.deployed().then(inst => wthb = inst);
  });

  it("should be able to add Walrus Coin to the system", async function() {
    assert.fail("not implement");
  })

  it("should not be able to add none Walrus Coin to the system", async function() {
    assert.fail("not implement");
  })

  it("can update the exchange rate of its coin", async function() {
    assert.fail("not implement");
  })

  it("should not allow update rate too frequence", async function() {
    assert.fail("not implement");
  })

});
