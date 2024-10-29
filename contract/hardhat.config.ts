import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { vars } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "amoy",
  networks: {
    amoy: {
      chainId: 80002,
      url: "https://polygon-amoy-bor-rpc.publicnode.com", // public rpc node
      accounts: [vars.get("AMOY_PRIVATE_KEY")],
    },
  },
  gasReporter: {
    enabled: true,
  },
};

export default config;
