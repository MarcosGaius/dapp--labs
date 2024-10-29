"use client";

import { useEffect, useState } from "react";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import { ConnectRequest } from "@/components/ConnectRequest";
import { Balance } from "@/components/Balance";
import { BLTM_TOKEN_CONTRACT, POOL_TOKEN_CONTRACT, USDC_CONTRACT } from "@/constants";
import { Transaction, TxsTable } from "@/components/TxsTable";
import MainSkeleton from "@/components/Skeleton";
import useContract from "@/hooks/useContract";
import bltmAbi from "@/artifacts/bltm-abi.json";
import poolAbi from "@/artifacts/pool-abi.json";
import erc20Abi from "@/artifacts/erc20-abi.json";
import { Actions } from "@/components/Actions";
import { BltmAbi, PoolAbi, Erc20Abi } from "@/types";
import { ethers } from "ethers";
import { TypedContractEvent, TypedEventLog } from "@/types/common";
import { SwapUSDCForBLTMEvent } from "@/types/PoolAbi";

type SwapEventsLogs = TypedEventLog<
  TypedContractEvent<SwapUSDCForBLTMEvent.InputTuple, SwapUSDCForBLTMEvent.OutputTuple, SwapUSDCForBLTMEvent.OutputObject>
>;

const buildTxFromEvent = async (event: SwapEventsLogs, provider: ethers.BrowserProvider) => {
  const isBltmForUsdc = event.eventName === "SwapBLTMForUSDC";

  const timestamp = (await provider.getBlock(event.blockNumber))?.timestamp;

  const { "0": sender, "1": v1, "2": v2 } = event.args;
  const date = timestamp ? new Date(timestamp * 1000).toISOString().split("T")[0] : "";
  const time = timestamp ? new Date(timestamp * 1000).toISOString().split("T")[1].split(".")[0] : "";
  const action = isBltmForUsdc ? "Withdraw" : "Deposit";

  return {
    date,
    time,
    action,
    amount: +ethers.formatUnits(isBltmForUsdc ? v1 : v2, 6),
    hash: event.transactionHash,
  } satisfies Transaction;
};

export default function Page() {
  const { status, address } = useWeb3ModalAccount();
  const { contract: bltmContract } = useContract<BltmAbi>(BLTM_TOKEN_CONTRACT, bltmAbi);
  const { contract: poolContract } = useContract<PoolAbi>(POOL_TOKEN_CONTRACT, poolAbi);
  const { contract: usdcContract, provider } = useContract<Erc20Abi>(USDC_CONTRACT, erc20Abi);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [rate, setRate] = useState<bigint | null>(null);
  const [loading, setLoading] = useState({ bltm: true, pool: true, events: true });

  useEffect(() => {
    if (!bltmContract || !address) return;
    const initializeBalance = async () => {
      try {
        setLoading((prev) => ({ ...prev, bltm: true }));
        const balance = await bltmContract.balanceOf(address);
        setBalance(balance);
      } catch (error) {
        console.error("Failed to initialize balance:", error);
      } finally {
        setLoading((prev) => ({ ...prev, bltm: false }));
      }
    };
    initializeBalance();
  }, [bltmContract, address]);

  useEffect(() => {
    if (!poolContract) return;
    const initializeRate = async () => {
      try {
        setLoading((prev) => ({ ...prev, pool: true }));
        const rate = await poolContract.getExchangeRate();
        setRate(rate);
      } catch (error) {
        console.error("Failed to initialize rate:", error);
      } finally {
        setLoading((prev) => ({ ...prev, pool: false }));
      }
    };
    initializeRate();
  }, [poolContract]);

  useEffect(() => {
    if (!poolContract || !address || !provider) return;

    const fetchPastEvents = async () => {
      try {
        setLoading((prev) => ({ ...prev, events: true }));
        const bltmUsdcfilter = poolContract.filters.SwapBLTMForUSDC(address);
        const usdcBltmfilter = poolContract.filters.SwapUSDCForBLTM(address);

        const currentBlockNumber = await provider.getBlockNumber();

        // Getting only the past 45000 blocks
        const events = await Promise.all([
          poolContract.queryFilter(usdcBltmfilter, currentBlockNumber - 45000, "latest"),
          poolContract.queryFilter(bltmUsdcfilter, currentBlockNumber - 45000, "latest"),
        ]);

        const formattedTransactions = events.flat().map(async (event) => buildTxFromEvent(event, provider));

        setTransactions(await Promise.all(formattedTransactions));
      } catch (error) {
        console.error("Failed to fetch past events:", error);
      } finally {
        setLoading((prev) => ({ ...prev, events: false }));
      }
    };

    fetchPastEvents();
  }, [address, poolContract, provider]);

  useEffect(() => {
    if (!poolContract || !address || !provider) return;

    const handleEvent = async (sender: any, v1: any, v2: any, event: SwapEventsLogs) => {
      const newTx = await buildTxFromEvent(event, provider);
      setTransactions((prevTransactions) => [newTx, ...prevTransactions]);
    };

    // const usdForBltmEvent = poolContract.getEvent("SwapUSDCForBLTM");
    // const bltmForUsdcEvent = poolContract.getEvent("SwapBLTMForUSDC");

    const bltmForUsdcEvent = poolContract.filters.SwapBLTMForUSDC(address);
    const usdForBltmEvent = poolContract.filters.SwapUSDCForBLTM(address);

    poolContract.on(usdForBltmEvent, handleEvent);
    poolContract.on(bltmForUsdcEvent, handleEvent);

    return () => {
      poolContract.off(usdForBltmEvent, handleEvent);
      poolContract.off(bltmForUsdcEvent, handleEvent);
    };
  }, [poolContract, address]);

  const onDeposit = async (value: bigint) => {
    if (!poolContract || !usdcContract || !address) return;
    try {
      const usdcBalance = await usdcContract.balanceOf(address);
      if (!usdcBalance || usdcBalance < value) return alert("Insufficient USDC balance");

      const currentAllowance = await usdcContract.allowance(address, POOL_TOKEN_CONTRACT);

      if (currentAllowance < value) {
        const tx = await usdcContract.approve(POOL_TOKEN_CONTRACT, value - currentAllowance);
        await tx.wait();
      }

      const tx = await poolContract.swapUsdcForBltm(value);
      await tx.wait();
      setBalance((prev) => (prev ? prev + value : value));
    } catch (error) {
      console.error("Error setting allowance:", error);
    }
  };

  const onWithdraw = async (value: bigint) => {
    if (!poolContract || !address) return;
    try {
      const tx = await poolContract.swapBltmForUsdc(value);
      await tx.wait();
      setBalance((prev) => (prev ? prev - value : null));
    } catch (error) {
      console.error("Error setting allowance:", error);
    }
  };

  if (status === "reconnecting") return <MainSkeleton />;
  if (status === "disconnected")
    return (
      <div className="flex items-center justify-center h-full flex-grow">
        <ConnectRequest />
      </div>
    );

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Balance bltm={balance} rate={rate} loading={loading.bltm || loading.pool} />
          <Actions balance={balance} onDeposit={onDeposit} onWithdraw={onWithdraw} />
        </div>
        <TxsTable transactions={transactions} loading={loading.events} />
      </div>
    </div>
  );
}
