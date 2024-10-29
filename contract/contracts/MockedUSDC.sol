// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MockedUSDC is  ERC20 {
  constructor() ERC20("USD Coin", "USDC") {
  }
  
  function decimals() public pure override returns (uint8) {
    return 6;
  }

  function mint(address account, uint256 amount) public virtual returns (bool) {
    _mint(account, amount);
    return true;
  }
}