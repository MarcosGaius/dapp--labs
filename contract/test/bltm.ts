import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("BLTM ERC20 Contract", function () {
  async function deployContractsFixture() {
    const publicClient = await hre.viem.getPublicClient();

    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const bltmToken = await hre.viem.deployContract("BLTM");
    const bltmTokenAsOtherAccount = await hre.viem.getContractAt("BLTM", bltmToken.address, { client: { wallet: otherAccount } });

    return {
      publicClient,
      owner,
      otherAccount,
      bltmToken,
      bltmTokenAsOtherAccount,
    };
  }

  describe("Deployment", function () {
    it("Should set the right roles", async function () {
      const { owner, bltmToken } = await loadFixture(deployContractsFixture);
      const [ownerRole, defaultAdminRole] = await Promise.all([bltmToken.read.OWNER_ROLE(), bltmToken.read.DEFAULT_ADMIN_ROLE()]);

      expect(
        await Promise.all([
          bltmToken.read.hasRole([ownerRole, owner.account.address]),
          bltmToken.read.hasRole([defaultAdminRole, owner.account.address]),
        ])
      ).not.includes(false);
    });

    it("Should set the right name and symbol", async function () {
      const { bltmToken } = await loadFixture(deployContractsFixture);
      expect(await bltmToken.read.name()).to.equal("BLTM");
      expect(await bltmToken.read.symbol()).to.equal("BLTM");
    });

    it("Should set the right decimals", async function () {
      const { bltmToken } = await loadFixture(deployContractsFixture);
      expect(await bltmToken.read.decimals()).to.equal(6);
    });
  });

  describe("Actions", function () {
    it("Owner role should be able to set roles", async function () {
      const { bltmToken, owner, otherAccount } = await loadFixture(deployContractsFixture);
      const minterRole = await bltmToken.read.MINTER_ROLE();

      await bltmToken.write.grantRole([minterRole, otherAccount.account.address]);
      expect(await bltmToken.read.hasRole([minterRole, otherAccount.account.address])).to.equal(true);
    });

    it("Owner role should be able to revoke roles", async function () {
      const { bltmToken, otherAccount } = await loadFixture(deployContractsFixture);
      const minterRole = await bltmToken.read.MINTER_ROLE();

      await bltmToken.write.grantRole([minterRole, otherAccount.account.address]);
      await bltmToken.write.revokeRole([minterRole, otherAccount.account.address]);
      expect(await bltmToken.read.hasRole([minterRole, otherAccount.account.address])).to.equal(false);
    });

    it("Non-owner role should not be able to set roles", async function () {
      const { bltmToken, otherAccount, bltmTokenAsOtherAccount } = await loadFixture(deployContractsFixture);
      const minterRole = await bltmToken.read.MINTER_ROLE();

      await expect(bltmTokenAsOtherAccount.write.grantRole([minterRole, otherAccount.account.address])).to.be.rejected;
    });

    it("Non-owner role should not be able to revoke roles", async function () {
      const { bltmToken, otherAccount, bltmTokenAsOtherAccount } = await loadFixture(deployContractsFixture);
      const minterRole = await bltmToken.read.MINTER_ROLE();

      await expect(bltmTokenAsOtherAccount.write.revokeRole([minterRole, otherAccount.account.address])).to.be.rejected;
    });

    it("Non-minter role should not be able to mint/burn", async function () {
      const { bltmToken, owner, otherAccount, bltmTokenAsOtherAccount } = await loadFixture(deployContractsFixture);

      await bltmToken.write.mint([owner.account.address, BigInt(100)]);

      await expect(bltmTokenAsOtherAccount.write.mint([otherAccount.account.address, BigInt(20)])).to.be.rejected;
      await expect(bltmTokenAsOtherAccount.write.burn([otherAccount.account.address, BigInt(20)])).to.be.rejected;
    });

    it("Minter role should be able to mint", async function () {
      const { bltmToken, bltmTokenAsOtherAccount, otherAccount } = await loadFixture(deployContractsFixture);

      await bltmToken.write.grantRole([await bltmToken.read.MINTER_ROLE(), otherAccount.account.address]);

      await bltmTokenAsOtherAccount.write.mint([otherAccount.account.address, BigInt(100)]);
      const balance = await bltmToken.read.balanceOf([otherAccount.account.address]);
      expect(balance).to.equal(100n);
    });

    it("Minter role should be able to burn", async function () {
      const { bltmToken, bltmTokenAsOtherAccount, otherAccount } = await loadFixture(deployContractsFixture);

      await bltmToken.write.grantRole([await bltmToken.read.MINTER_ROLE(), otherAccount.account.address]);

      await bltmTokenAsOtherAccount.write.mint([otherAccount.account.address, BigInt(100)]);

      const balance = await bltmToken.read.balanceOf([otherAccount.account.address]);
      expect(balance).to.equal(100n);

      await bltmTokenAsOtherAccount.write.burn([otherAccount.account.address, BigInt(50)]);

      const newBalance = await bltmToken.read.balanceOf([otherAccount.account.address]);
      expect(newBalance).to.equal(50n);
    });

    it("Pauser role should be able to pause/unpause", async function () {
      const { bltmToken, bltmTokenAsOtherAccount, otherAccount } = await loadFixture(deployContractsFixture);
      const pauserRole = await bltmToken.read.PAUSER_ROLE();

      await bltmToken.write.grantRole([pauserRole, otherAccount.account.address]);
      await bltmTokenAsOtherAccount.write.pause();
      expect(await bltmToken.read.paused()).to.equal(true);
      await bltmTokenAsOtherAccount.write.unpause();
      expect(await bltmToken.read.paused()).to.equal(false);
    });

    it("Non-pauser role should not be able to pause/unpause", async function () {
      const { bltmTokenAsOtherAccount } = await loadFixture(deployContractsFixture);

      await expect(bltmTokenAsOtherAccount.write.pause()).to.be.rejected;
      await expect(bltmTokenAsOtherAccount.write.unpause()).to.be.rejected;
    });
  });
});
