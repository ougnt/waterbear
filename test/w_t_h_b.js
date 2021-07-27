const Exceptions = require('./exceptions.js');
const WTHB = artifacts.require("WTHB");
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

contract("WTHB - Should be able to mint and redeem (happy case)", function ( accounts ) {
  let wthbsc;
  let wthbaddr;
  let busdsc;
  it('should be able to deploy contracts', async function() {
    await WTHB.deployed().then( inst => {
      wthbsc = inst
      wthbaddr = inst.address;
    });
    if(NETWORK === 'development') {
      await FakeBUSD.deployed().then( inst => busdsc = inst);
    }
  })

  it("can show balance both wthb and fakebusd", async function () {
    await wthbsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 0))
    await busdsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 0))
  });

  it("mint with BUSD", async function () {
    if(NETWORK === 'development') {
      await busdsc.mint(1000, {from: accounts[0]})
    }
    await busdsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 1000))
  });

  it("can mint wthb with minted busd", async function() {
    await busdsc.approve(wthbaddr, '1001', {from:accounts[0]});
    await wthbsc.mintFromBUSD(1000, {from: accounts[0]});
    await wthbsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 32000));
    await busdsc.balanceOf.call(wthbaddr).then( bal => assert.equal(bal, 1000));
  })

  it("the minter's book is in the shelf", async function() {
    await wthbsc.getShelf.call({from: accounts[0]}).then( res => {
      assert.equal(res.length, 1)
      assert.equal(res[0], 1)
      return wthbsc.getBook.call(res[0], {from:accounts[0]})
    }).then(book => {
      assert.equal(book.length, 2, "Book doesn't contain 2 elements")
      assert.equal(book[0], 1000, "unmatch BUSD collateral")
      assert.equal(book[1], 32000, "unmatch minted WTHB")
    })
  })

  it("can partially redeem the minted wthb, the minter got partially", async function() {
    await wthbsc.redeemFromBUSD(1, 7000, {from:accounts[0]})
    
    await wthbsc.balanceOf(accounts[0]).then(bal => assert.equal(bal, 25000, "WTHB amount of minter doesn't reset to 25000 after redeem (partial)"))
    await wthbsc.balanceOf(wthbaddr).then(bal => assert.equal(bal, 0, "WTHB amount of contract doesn't reset to 0 after redeem (partial)"))

    await busdsc.balanceOf(wthbaddr).then(bal => assert.equal(bal, 782, "BUSD amount of contract doesn't reset to 782 after redeem (partial)"))
    await busdsc.balanceOf(accounts[0]).then(bal => assert.equal(bal, 218, "BUSD amount of minter doesn't reset to 218 after redeem (partial)"))
    
    await wthbsc.getShelf.call({from: accounts[0]}).then( res => {
      assert.equal(res.length, 1)
      assert.equal(res[0], 1)
      return wthbsc.getBook.call(res[0], {from: accounts[0]})
    }).then(res => {
      assert.equal(res.length, 2, "Book doesn't contain 2 elements")
      assert.equal(res[0], 782, "unmatch BUSD collateral")
      assert.equal(res[1], 25000, "unmatch minted WTHB")
    })
  })

  it("can full redeem the minted wthb, the minter got money back, the rest amount return to 0", async function() {
    await wthbsc.redeemFromBUSD(1, 25000, {from:accounts[0]})
    
    await wthbsc.balanceOf(accounts[0]).then(bal => assert.equal(bal, 0, "WTHB amount of minter doesn't reset to 0 after redeem (full)"))
    await wthbsc.balanceOf(wthbaddr).then(bal => assert.equal(bal, 0, "WTHB amount of contract doesn't reset to 0 after redeem (full)"))

    await busdsc.balanceOf(wthbaddr).then(bal => assert.equal(bal, 0, "BUSD amount of contract doesn't reset to 0 after redeem (full)"))
    await busdsc.balanceOf(accounts[0]).then(bal => assert.equal(bal, 1000, "BUSD amount of minter doesn't reset to 1000 after redeem (full)"))
    
    await wthbsc.getShelf.call({from: accounts[0]}).then( res => {
      assert.equal(res.length, 1)
      assert.equal(res[0], 1)
      return wthbsc.getBook.call(res[0], {from: accounts[0]})
    }).then(res => {
      assert.equal(res.length, 2, "Book doesn't contain 2 elements")
      assert.equal(res[0], 0, "unmatch BUSD collateral")
      assert.equal(res[1], 0, "unmatch minted WTHB")
    })
  })
});

contract("WTHB - Should be able to mint and redeem (multiple minters)", function ( accounts ) {
  let wthbsc;
  let wthbaddr;
  let busdsc;
  it('should be able to deploy contracts', async function() {
    await WTHB.deployed().then( inst => {
      wthbsc = inst
      wthbaddr = inst.address;
    });
    await FakeBUSD.deployed().then( inst => busdsc = inst);
  })

  it("can show balance both wthb and fakebusd", async function () {
    await wthbsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 0))
    await busdsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 0))
    await wthbsc.balanceOf.call(accounts[1]).then( bal => assert.equal(bal, 0))
    await busdsc.balanceOf.call(accounts[1]).then( bal => assert.equal(bal, 0))
  });

  it("mint with BUSD", async function () {
    if(NETWORK === 'development') {
      await busdsc.mint(6000, {from: accounts[0]})
    }
    await busdsc.transfer(accounts[1], 5000, {from: accounts[0]});
  });

  it("can mint wthb with minted busd", async function() {
    await busdsc.approve(wthbaddr, '1000', {from:accounts[0]});
    await busdsc.approve(wthbaddr, '5000', {from:accounts[1]});
    
    await wthbsc.mintFromBUSD(1000, {from: accounts[0]});
    await wthbsc.mintFromBUSD(3000, {from: accounts[1]});
    await wthbsc.mintFromBUSD(2000, {from: accounts[1]});
    
    await wthbsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 32000));
    await wthbsc.balanceOf.call(accounts[1]).then( bal => assert.equal(bal, 160000));
    await busdsc.balanceOf.call(wthbaddr).then( bal => assert.equal(bal, 6000));
    
  })

  it("the minter's book is in the shelf", async function() {
    await wthbsc.getShelf.call({from: accounts[0]}).then( res => {
      assert.equal(res.length, 1)
      assert.equal(res[0], 1)
      return wthbsc.getBook.call(res[0], {from:accounts[0]})
    }).then(res => {
      assert.equal(res.length, 2, "Book doesn't contain 2 elements")
      assert.equal(res[0], 1000, "unmatch BUSD collateral")
      assert.equal(res[1], 32000, "unmatch minted WTHB")
    })

    await wthbsc.getShelf.call({from: accounts[1]}).then( res => {
      assert.equal(res.length, 2)
      assert.equal(res[0], 2)
      assert.equal(res[1], 3)
      return wthbsc.getBook.call(res[0], {from: accounts[1]})
    }).then(res => {
      assert.equal(res.length, 2, "Book doesn't contain 2 elements")
      assert.equal(res[0], 3000, "unmatch BUSD collateral")
      assert.equal(res[1], 96000, "unmatch minted WTHB")
    })
  })

  it("can full redeem the minted wthb, the minter 1 got money back, the rest amount return to 0", async function() {
    await wthbsc.redeemFromBUSD(1, 32000, {from:accounts[0]})
    
    await wthbsc.balanceOf(accounts[0]).then(bal => assert.equal(bal, 0, "WTHB amount of minter doesn't reset to 0 after redeem (full)"))
    await wthbsc.balanceOf(wthbaddr).then(bal => assert.equal(bal, 0, "WTHB amount of contract doesn't reset to 0 after redeem (full)"))

    await busdsc.balanceOf(wthbaddr).then(bal => assert.equal(bal, 5000, "BUSD amount of contract doesn't reset to 0 after redeem (full)"))
    await busdsc.balanceOf(accounts[0]).then(bal => assert.equal(bal, 1000, "BUSD amount of minter doesn't reset to 1000 after redeem (full)"))
    
    await wthbsc.getShelf.call({from: accounts[0]}).then( res => {
      assert.equal(res.length, 1)
      assert.equal(res[0], 1)
      return wthbsc.getBook.call(res[0], {from: accounts[0]})
    }).then(res => {
      assert.equal(res.length, 2, "Book doesn't contain 2 elements")
      assert.equal(res[0], 0, "unmatch BUSD collateral")
      assert.equal(res[1], 0, "unmatch minted WTHB")
    })
  })

  it("can full redeem the minted wthb, the minter 2 got money back, the rest amount return to 0", async function() {
    await wthbsc.redeemFromBUSD(3, 64000, {from:accounts[1]})
    
    await wthbsc.balanceOf(accounts[1]).then(bal => assert.equal(bal, 96000, "WTHB amount of minter doesn't reset to 0 after redeem (full)"))
    await wthbsc.balanceOf(wthbaddr).then(bal => assert.equal(bal, 0, "WTHB amount of contract doesn't reset to 0 after redeem (full)"))

    await busdsc.balanceOf(wthbaddr).then(bal => assert.equal(bal, 3000, "BUSD amount of contract doesn't reset to 0 after redeem (full)"))
    await busdsc.balanceOf(accounts[1]).then(bal => assert.equal(bal, 2000, "BUSD amount of minter doesn't reset to 1000 after redeem (full)"))
    
    let books;
    await wthbsc.getShelf.call({from: accounts[1]}).then( res => {
      assert.equal(res.length, 2)
      assert.equal(res[0], 2)
      assert.equal(res[1], 3)
      books = res
    })
    
    await wthbsc.getBook.call(books[0], {from: accounts[1]}).then(book => {
      assert.equal(book.length, 2, "Book doesn't contain 2 elements")
      assert.equal(book[0], 3000, "unmatch BUSD collateral")
      assert.equal(book[1], 96000, "unmatch minted WTHB")
    })

    await wthbsc.getBook.call(books[1], {from: accounts[1]}).then(book => {
      assert.equal(book.length, 2, "Book doesn't contain 2 elements")
      assert.equal(book[0], 0, "unmatch BUSD collateral")
      assert.equal(book[1], 0, "unmatch minted WTHB")
    })
  })
});

contract("WTHB - Should be able to mint and redeem (happy case)", function ( accounts ) {
  let wthbsc;
  let wthbaddr;
  let busdsc;
  it('should be able to deploy contracts', async function() {
    await WTHB.deployed().then( inst => {
      wthbsc = inst
      wthbaddr = inst.address;
    });
    await FakeBUSD.deployed().then( inst => busdsc = inst);
    await wthbsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 0))
    await busdsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 0))

    if(NETWORK === 'development') {
      await busdsc.mint(1000, {from: accounts[0]})
    }
    await busdsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 1000))
    await busdsc.approve(wthbaddr, '800', {from:accounts[0]});
  })

  it("show error when mint more than money", async function() {
    await Exceptions.tryCatch(wthbsc.mintFromBUSD(1001, {from: accounts[0]}), 'revert BEP20: transfer amount exceeds balance -- Reason given: BEP20: transfer amount exceeds balance.');
  })

  it("show error when mint more than allowance", async function() {
    await Exceptions.tryCatch(wthbsc.mintFromBUSD(801, {from: accounts[0]}), 'revert BEP20: transfer amount exceeds allowance -- Reason given: BEP20: transfer amount exceeds allowance.');
  })

  it("should error when update the exchange rate from someone not core contract", async function() {
    await Exceptions.tryCatch(wthbsc.updateExchangeRate('31000000000000000000',   {from:accounts[1]}), 'revert WalrusCoin: Only the core contract can call this function.')
  })
});

contract("WTHB - Should be able to update exchange rate", function ( accounts ) {
  let wthbsc;
  let wthbaddr;
  let busdsc;
  it('should be able to deploy contracts', async function() {
    await WTHB.deployed().then( inst => {
      wthbsc = inst
      wthbaddr = inst.address;
    });
    await FakeBUSD.deployed().then( inst => busdsc = inst);
    await wthbsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 0))
    await busdsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 0))

    if(NETWORK === 'development') {
      await busdsc.mint(1000, {from: accounts[0]})
    }
    await busdsc.balanceOf.call(accounts[0]).then( bal => assert.equal(bal, 1000))
    await busdsc.approve(wthbaddr, '800', {from:accounts[0]});
  })
});