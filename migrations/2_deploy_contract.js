var WThb = artifacts.require('./WTHB.sol')
var WJpy = artifacts.require('./WJPY.sol')
var FakeBUSD = artifacts.require('./fake/FakeBUSD.sol')
var WalrusCore = artifacts.require("WalrusCore.sol");
var Fang = artifacts.require("./Fang.sol")

module.exports = async function(deployer, network) {
  // Use deployer to state migration tasks.
  var coreAddr;
  var fangAddr;
  var busdAddr;
    
  await deployer.deploy(WalrusCore).then( core => {
    coreAddr = core.address
    deployer.deploy(Fang, coreAddr).then( fang => fangAddr = fang.address);
  });

  if(network == 'development') {
    var busd = await deployer.deploy(FakeBUSD);
    busdAddr = busd.address;

  } else if (network == 'testnet') {
    busdAddr = '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee'
  }  
  await deployer.deploy(WThb, '32000000000000000000', busdAddr, coreAddr)
  await deployer.deploy(WJpy, '00009100000000000000', busdAddr, coreAddr)
};