// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./BLTM.sol"; 

contract LiquidityPool is AccessControl, Pausable {
    IERC20 public usdc;
    BLTM public bltm;
    uint256 public exchangeRate;
    uint256 public royaltyTax = 200; // 2% (200 basis points)

    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

    event SwapBLTMForUSDC(address indexed user, uint256 bltmAmount, uint256 usdcAmount);
    event SwapUSDCForBLTM(address indexed user, uint256 usdcAmount, uint256 bltmAmount);
    event ExchangeRateUpdated(uint256 newRate);
    event RoyaltyTaxUpdated(uint256 newTax);
    event USDCWithdrawn(address indexed owner, uint256 amount);
    event USDCDeposited(address indexed owner, uint256 amount);

    constructor(address usdcAddress, address bltmAddress, uint256 initialRate) {
        require(usdcAddress != address(0), "Invalid USDC address");
        require(bltmAddress != address(0), "Invalid BLTM token address");
        require(initialRate > 0, "Initial exchange rate must be positive");

        usdc = IERC20(usdcAddress);
        bltm = BLTM(bltmAddress);
        exchangeRate = initialRate;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OWNER_ROLE, msg.sender);
    }

    function getExchangeRate() public view returns (uint256) {
        return exchangeRate;
    }

    function getPoolPairAddresses() public view returns (address, address) {
        return (address(usdc), address(bltm));
    }

    function getRoyaltyTax() public view returns (uint256) {
        return royaltyTax;
    }

    function setRoyaltyTax(uint256 newTax) external onlyRole(OWNER_ROLE) whenNotPaused {
        require(newTax <= 10000, "Tax cannot exceed 100%");
        royaltyTax = newTax;
        emit RoyaltyTaxUpdated(newTax);
    }

    function updateExchangeRate(uint256 rate) external onlyRole(OWNER_ROLE) whenNotPaused {
        require(rate > 0, "Exchange rate must be positive");
        exchangeRate = rate;
        emit ExchangeRateUpdated(rate);
    }

    function swapUsdcForBltm(uint256 usdcAmount) external whenNotPaused {
        require(usdcAmount > 0, "Amount must be positive");

        uint256 royaltyFee = Math.mulDiv(usdcAmount, royaltyTax, 10000); // 10000 = 100%
        uint256 netUsdcAmount = usdcAmount - royaltyFee;

        uint256 bltmAmount = Math.mulDiv(netUsdcAmount, exchangeRate, 1e6);

        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");

        bltm.mint(msg.sender, bltmAmount);

        emit SwapUSDCForBLTM(msg.sender, usdcAmount, bltmAmount);
    }

    function swapBltmForUsdc(uint256 bltmAmount) external whenNotPaused {
        require(bltmAmount > 0, "Amount must be positive");

        uint256 usdcAmount = Math.mulDiv(bltmAmount, 1e6, exchangeRate); 

        require(bltm.burn(msg.sender, bltmAmount), "BLTM burn failed");
        require(usdc.transfer(msg.sender, usdcAmount), "USDC transfer failed");

        emit SwapBLTMForUSDC(msg.sender, bltmAmount, usdcAmount);
    }

    function withdrawUsdc(uint256 usdcAmount) external onlyRole(OWNER_ROLE) whenNotPaused {
        require(usdcAmount > 0, "Amount must be positive");
        require(usdc.transfer(msg.sender, usdcAmount), "USDC transfer failed");

        emit USDCWithdrawn(msg.sender, usdcAmount);
    }

    function depositUsdc(uint256 usdcAmount) external onlyRole(OWNER_ROLE) whenNotPaused {
        require(usdcAmount > 0, "Amount must be positive");
        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");

        emit USDCDeposited(msg.sender, usdcAmount);
    }

    function pause() external onlyRole(OWNER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(OWNER_ROLE) {
        _unpause();
    }
}
