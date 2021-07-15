var WThb = artifacts.require('./WTHB.sol')
var FakeBUSD = artifacts.require('./fake/FakeBUSD.sol')
var WalrusCore = artifacts.require("WalrusCore.sol");

module.exports = function(deployer, network) {
  // Use deployer to state migration tasks.
  deployer.deploy(WalrusCore);

  if(network == 'development') {
    deployer.deploy(FakeBUSD).then(inst => deployer.deploy(WThb, inst.address));
    
  } else if (network == 'testnet') {
    deployer.deploy(WThb, '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee');    
  }
};