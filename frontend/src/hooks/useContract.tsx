import { useState, useEffect, useMemo } from "react";
import { ethers, BaseContract, BrowserProvider } from "ethers";
import { useWeb3ModalProvider } from "@web3modal/ethers/react";

const useContract = <T extends BaseContract>(contractAddress: string, abi: any) => {
  const { walletProvider } = useWeb3ModalProvider();
  const [contract, setContract] = useState<T | null>(null);

  const provider = useMemo(() => {
    return walletProvider ? new BrowserProvider(walletProvider) : null;
  }, [walletProvider]);

  useEffect(() => {
    const initializeContract = async () => {
      if (!provider || !contractAddress) {
        setContract(null);
        return;
      }
      try {
        const signer = await provider.getSigner();
        const contractInstance = new ethers.BaseContract(contractAddress, abi, signer) as T;
        setContract(contractInstance);
      } catch (error) {
        console.error("Failed to initialize contract:", error);
        setContract(null);
      }
    };

    initializeContract();
  }, [provider, contractAddress, abi]);

  return { contract, provider };
};

export default useContract;
