// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

abstract contract Modifiers {
  
  address owneraddress = 0x40C57713041D713C1E9f65Aa7993458b5B350636;

  modifier owneronly() {
    require(msg.sender == owneraddress, "msg sender is not the owner of the contract");
    _;
  }
}
