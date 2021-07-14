// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.9.0;

import "../../node_modules/@pancakeswap/pancake-swap-lib/contracts/token/BEP20/BEP20.sol";

contract FakeBUSD is BEP20 {
    constructor() BEP20("Fake BUSD", "fBUSD") public {  }
}