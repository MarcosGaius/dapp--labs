import hre from "hardhat";
import LiquidityPoolModule from "../ignition/modules/pool";
import { USDC_AMOY_ADDRESS } from "../constants";
import BLTMTokenModule from "../ignition/modules/bltm";

async function main() {
  const { bltmToken } = await hre.ignition.deploy(BLTMTokenModule);

  console.info(`BLTM contract deployed: ${bltmToken.address}`);

  const { liquidityPool } = await hre.ignition.deploy(LiquidityPoolModule, {
    parameters: {
      LiquidityPoolModule: {
        usdcAddress: USDC_AMOY_ADDRESS,
        bltmAddress: bltmToken.address,
        initialRate: 1e6,
      },
    },
  });

  console.info(`Liquidity Pool contract deployed: ${liquidityPool.address}`);

  await bltmToken.write.grantRole([await bltmToken.read.MINTER_ROLE(), liquidityPool.address]);

  console.info(`BLTM Minter role granted to Liquidity Pool: ${liquidityPool.address}`);
}

main().catch(console.error);
