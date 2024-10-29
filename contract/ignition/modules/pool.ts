import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LiquidityPoolModule = buildModule("LiquidityPoolModule", (m) => {
  const usdcAddress = m.getParameter("usdcAddress");
  const bltmAddress = m.getParameter("bltmAddress");
  const initialRate = m.getParameter("initialRate");

  if (!usdcAddress || !bltmAddress || !initialRate) throw new Error("Missing parameter");

  const liquidityPool = m.contract("LiquidityPool", [usdcAddress, bltmAddress, initialRate]);

  return {
    liquidityPool,
  };
});

export default LiquidityPoolModule;
