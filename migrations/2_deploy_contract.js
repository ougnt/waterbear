var WThb = artifacts.require('./WTHB.sol')
var FakeBUSD = artifacts.require('./fake/FakeBUSD.sol')
var WalrusCore = artifacts.require("WalrusCore.sol");
var Fang = artifacts.require("./Fang.sol")

module.exports = function(deployer, network) {
  // Use deployer to state migration tasks.
  var coreAddr;
  var fangAddr;
    
  deployer.deploy(WalrusCore).then( core => {
    coreAddr = core.address
    deployer.deploy(Fang, coreAddr).then( fang => fangAddr = fang.address);
  });

  if(network == 'development') {
    deployer.deploy(FakeBUSD).then(busd => deployer.deploy(WThb, '32000000000000000000', busd.address, coreAddr));
    
  } else if (network == 'testnet') {
    deployer.deploy(WThb, '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee');    
  }
};