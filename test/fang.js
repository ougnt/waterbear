const Fang = artifacts.require("Fang");
const Exceptions = require('./exceptions.js');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Fang", function ( accounts ) {
  let fang;
  it("should deployable", async function () {
    await Fang.deployed().then(inst => fang = inst);
  });

  it("should throw error when non-core contract call to distribute the reward", async function() {
    
    await Exceptions.tryCatch(fang.distributeReward(accounts[2], '100000000', {from: accounts[0]}), 'revert Fang: Only the core contract can call this function.')
  });
});
