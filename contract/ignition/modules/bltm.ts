import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BLTMTokenModule = buildModule("BLTMTokenModule", (m) => {
  const bltmToken = m.contract("BLTM");

  return {
    bltmToken,
  };
});

export default BLTMTokenModule;
