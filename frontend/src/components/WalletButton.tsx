"use client";

import { useDisconnect, useWeb3Modal, useWeb3ModalAccount } from "@web3modal/ethers/react";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";

export const WalletButton = () => {
  const { isConnected, status } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const isLoading = status === "reconnecting";

  if (isLoading) return <></>;

  return (
    <Button className="btn-primary text-slate-700" onClick={() => (isConnected ? disconnect() : open())} disabled={isLoading}>
      <Wallet className="mr-2 h-4 w-4" />
      {isConnected ? "Disconnect" : "Connect"}
    </Button>
  );
};
