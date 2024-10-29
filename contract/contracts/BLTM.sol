// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract BLTM is ERC20, Pausable, AccessControl {
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER");
  bytes32 public constant MINTER_ROLE = keccak256("MINTER");
  bytes32 public constant OWNER_ROLE = keccak256("OWNER");

  constructor() ERC20("BLTM", "BLTM") {
    _grantRole(OWNER_ROLE, msg.sender);
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(PAUSER_ROLE, msg.sender);
    _grantRole(MINTER_ROLE, msg.sender); 
  }

  function decimals() public pure override returns (uint8) {
    return 6;
  }

  function mint(address account, uint256 amount) public whenNotPaused onlyRole(MINTER_ROLE) returns (bool) {
    _mint(account, amount);
    return true;
  }

  function burn(address account, uint256 amount) public whenNotPaused onlyRole(MINTER_ROLE) returns (bool) {
    _burn(account, amount);
    return true;
  }

  function pause() public whenNotPaused onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() public whenPaused onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  // check if an account has the role, owner is always authorized
  function _checkRole(bytes32 role, address account) internal view virtual override {
    if (hasRole(OWNER_ROLE, account) || hasRole(role, account)) {
      return;
    }
    revert AccessControlUnauthorizedAccount(account, role);
  }
}