import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("LiquidityPool Contract", function () {
  async function deployContractsFixture() {
    const publicClient = await hre.viem.getPublicClient();

    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const usdc = await hre.viem.deployContract("MockedUSDC");
    const usdcAsOtherAccount = await hre.viem.getContractAt("MockedUSDC", usdc.address, { client: { wallet: otherAccount } });

    const bltmToken = await hre.viem.deployContract("BLTM");
    const bltmAsOtherAccount = await hre.viem.getContractAt("BLTM", bltmToken.address, { client: { wallet: otherAccount } });

    const liquidityPool = await hre.viem.deployContract("LiquidityPool", [usdc.address, bltmToken.address, BigInt(1e6)]);
    const liquidityPoolAsOtherAccount = await hre.viem.getContractAt("LiquidityPool", liquidityPool.address, {
      client: { wallet: otherAccount },
    });

    await bltmToken.write.grantRole([await bltmToken.read.MINTER_ROLE(), liquidityPool.address]);

    return {
      publicClient,
      owner,
      otherAccount,
      liquidityPoolAsOtherAccount,
      liquidityPool,
      bltmToken,
      bltmAsOtherAccount,
      usdc,
      usdcAsOtherAccount,
    };
  }

  describe("Deployment", function () {
    it("Should set the right initial exchange rate", async function () {
      const { liquidityPool } = await loadFixture(deployContractsFixture);
      expect(await liquidityPool.read.getExchangeRate()).to.equal(BigInt(1e6));
    });

    it("Should assign the minter role to the pool contract", async function () {
      const { bltmToken, liquidityPool } = await loadFixture(deployContractsFixture);
      const MINTER_ROLE = await bltmToken.read.MINTER_ROLE();
      expect(await bltmToken.read.hasRole([MINTER_ROLE, liquidityPool.address])).to.be.true;
    });

    it("Should set the initial royalty tax to 2%", async function () {
      const { liquidityPool } = await loadFixture(deployContractsFixture);
      expect(await liquidityPool.read.getRoyaltyTax()).to.equal(200n);
    });

    it("Should set the right pool pair addresses", async function () {
      const { liquidityPool, bltmToken, usdc } = await loadFixture(deployContractsFixture);
      const [usdcAddress, bltmAddress] = await liquidityPool.read.getPoolPairAddresses();
      expect(usdcAddress.toLowerCase()).to.equal(usdc.address);
      expect(bltmAddress.toLowerCase()).to.equal(bltmToken.address);
    });
  });

  describe("Swap and Exchange", function () {
    it("Should swap USDC for BLTM correctly", async function () {
      const { liquidityPool, liquidityPoolAsOtherAccount, usdc, usdcAsOtherAccount, bltmToken, otherAccount } = await loadFixture(
        deployContractsFixture
      );
      await liquidityPool.write.setRoyaltyTax([0n]);

      await usdc.write.mint([otherAccount.account.address, BigInt(1000e6)]);

      await usdcAsOtherAccount.write.approve([liquidityPool.address, BigInt(1000e6)]);

      await liquidityPoolAsOtherAccount.write.swapUsdcForBltm([BigInt(300e6)]);
      expect(await usdc.read.balanceOf([liquidityPool.address])).to.equal(BigInt(300e6));
      expect(await bltmToken.read.balanceOf([otherAccount.account.address])).to.equal(BigInt(300e6));
    });

    it("Should swap BLTM for USDC correctly", async function () {
      const { usdc, bltmToken, liquidityPool, liquidityPoolAsOtherAccount, otherAccount } = await loadFixture(deployContractsFixture);

      await bltmToken.write.mint([otherAccount.account.address, BigInt(900e6)]);
      await usdc.write.mint([liquidityPool.address, BigInt(30000e6)]);

      await liquidityPoolAsOtherAccount.write.swapBltmForUsdc([BigInt(600e6)]);
      expect(await bltmToken.read.balanceOf([otherAccount.account.address])).to.equal(BigInt(300e6));
      expect(await usdc.read.balanceOf([otherAccount.account.address])).to.equal(BigInt(600e6));
    });

    it("Should apply royalty when swapping USDC for BLTM", async function () {
      const { liquidityPool, liquidityPoolAsOtherAccount, usdc, usdcAsOtherAccount, bltmToken, otherAccount } = await loadFixture(
        deployContractsFixture
      );
      await usdc.write.mint([otherAccount.account.address, BigInt(1000e6)]);
      await usdcAsOtherAccount.write.approve([liquidityPool.address, BigInt(1000e6)]);

      await liquidityPoolAsOtherAccount.write.swapUsdcForBltm([BigInt(300e6)]);

      const royalty = (BigInt(300e6) * 2n) / 100n;
      const expectedBltm = BigInt(300e6) - royalty;

      expect(await usdc.read.balanceOf([liquidityPool.address])).to.equal(BigInt(300e6));
      expect(await bltmToken.read.balanceOf([otherAccount.account.address])).to.equal(expectedBltm);
    });

    it("Should update BLTM received based on new royalty rate", async function () {
      const { liquidityPool, liquidityPoolAsOtherAccount, usdc, usdcAsOtherAccount, bltmToken, otherAccount } = await loadFixture(
        deployContractsFixture
      );

      await liquidityPool.write.setRoyaltyTax([5n]);

      await usdc.write.mint([otherAccount.account.address, BigInt(1000e6)]);
      await usdcAsOtherAccount.write.approve([liquidityPool.address, BigInt(1000e6)]);

      await liquidityPoolAsOtherAccount.write.swapUsdcForBltm([BigInt(200e6)]);

      const royalty = (BigInt(200e6) * 5n) / 10000n;
      const expectedBltm = BigInt(200e6) - royalty;

      expect(await usdc.read.balanceOf([liquidityPool.address])).to.equal(BigInt(200e6));
      expect(await bltmToken.read.balanceOf([otherAccount.account.address])).to.equal(expectedBltm);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow the owner to update the exchange rate", async function () {
      const { liquidityPool, owner } = await loadFixture(deployContractsFixture);
      await liquidityPool.write.updateExchangeRate([4n]);
      expect(await liquidityPool.read.getExchangeRate()).to.equal(4n);
    });

    it("Should prevent non-owners from updating the exchange rate", async function () {
      const { liquidityPoolAsOtherAccount } = await loadFixture(deployContractsFixture);
      await expect(liquidityPoolAsOtherAccount.write.updateExchangeRate([4n])).to.be.rejected;
    });

    it("Should allow the owner to withdraw USDC", async function () {
      const { liquidityPool, usdc, owner } = await loadFixture(deployContractsFixture);
      await usdc.write.mint([liquidityPool.address, BigInt(500e6)]);
      await liquidityPool.write.withdrawUsdc([BigInt(300e6)]);
      expect(await usdc.read.balanceOf([owner.account.address])).to.equal(BigInt(300e6));
    });

    it("Should prevent non-owners from withdrawing USDC", async function () {
      const { liquidityPool } = await loadFixture(deployContractsFixture);
      await expect(liquidityPool.write.withdrawUsdc([BigInt(300e6)])).to.be.rejected;
    });
  });

  describe("Deposit USDC", function () {
    it("Should allow the owner to deposit USDC", async function () {
      const { liquidityPool, usdc, owner } = await loadFixture(deployContractsFixture);
      await usdc.write.mint([owner.account.address, BigInt(500e6)]);
      await usdc.write.approve([liquidityPool.address, BigInt(500e6)]);
      await liquidityPool.write.depositUsdc([BigInt(500e6)]);
      expect(await usdc.read.balanceOf([liquidityPool.address])).to.equal(BigInt(500e6));
    });

    it("Should prevent non-owners from depositing USDC", async function () {
      const { liquidityPool, usdc, usdcAsOtherAccount, otherAccount } = await loadFixture(deployContractsFixture);
      await usdc.write.mint([otherAccount.account.address, BigInt(500e6)]);
      await usdcAsOtherAccount.write.approve([liquidityPool.address, BigInt(500e6)]);
      await expect(liquidityPool.write.depositUsdc([BigInt(500e6)])).to.be.rejected;
    });

    it("Should allow the owner to update the exchange rate", async function () {
      const { liquidityPool } = await loadFixture(deployContractsFixture);
      await liquidityPool.write.updateExchangeRate([4n]);
      expect(await liquidityPool.read.getExchangeRate()).to.equal(4n);
    });

    it("Should prevent non-owners from updating the exchange rate", async function () {
      const { liquidityPoolAsOtherAccount } = await loadFixture(deployContractsFixture);
      await expect(liquidityPoolAsOtherAccount.write.updateExchangeRate([4n])).to.be.rejected;
    });

    it("Should allow the owner to set the royalty tax", async function () {
      const { liquidityPool } = await loadFixture(deployContractsFixture);
      await liquidityPool.write.setRoyaltyTax([5n]);
      expect(await liquidityPool.read.getRoyaltyTax()).to.equal(5n);
    });

    it("Should prevent non-owners from setting the royalty tax", async function () {
      const { liquidityPoolAsOtherAccount } = await loadFixture(deployContractsFixture);
      await expect(liquidityPoolAsOtherAccount.write.setRoyaltyTax([5n])).to.be.rejected;
    });
  });
});
