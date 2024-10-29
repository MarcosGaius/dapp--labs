"use client";

import { AMOY_CHAIN, PROJECT_ID } from "@/constants";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

const metadata = {
  name: "BLTM dApp",
  description: "The best dApp for Blank Labs!",
  url: "https://mywebsite.com",
  icons: ["https://avatars.mywebsite.com/"],
};

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
});

createWeb3Modal({
  ethersConfig,
  chains: [AMOY_CHAIN],
  projectId: PROJECT_ID,
  enableAnalytics: false,
});

export function AppKit({ children }: { children: React.ReactNode }) {
  return children;
}
