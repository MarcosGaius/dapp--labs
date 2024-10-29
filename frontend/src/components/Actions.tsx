"use client";

import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseUnits } from "ethers";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ActionProps {
  balance: bigint | null;
  onDeposit: (value: bigint) => Promise<void>;
  onWithdraw: (value: bigint) => Promise<void>;
}

export const Actions = ({ balance, onDeposit, onWithdraw }: ActionProps) => {
  const [value, setValue] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!value) return;
    try {
      setLoading(true);
      await onDeposit(parseUnits(value, 6));
    } catch (error) {
      console.error("Failed to deposit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!value) return;
    try {
      setLoading(true);
      await onWithdraw(parseUnits(value, 6));
    } catch (error) {
      console.error("Failed to withdraw:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-purple-500/20">
      <h2 className="text-xl font-semibold mb-4">Actions</h2>
      <div className="space-y-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <Label htmlFor="liquidity-amount" className="text-sm text-gray-400">
            Amount
          </Label>
          <Input
            id="liquidity-amount"
            type="number"
            placeholder="0.0"
            className="mt-1 w-full bg-transparent border-none text-xl focus:ring-0"
            min={1}
            onBlur={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="flex space-x-4">
          <Button
            disabled={!value || loading}
            className={cn(
              "flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200",
              loading && "animate-pulse"
            )}
            onClick={handleDeposit}
          >
            <Plus className="mr-2 h-4 w-4" /> Deposit
          </Button>
          <Button
            disabled={!balance || loading}
            className={cn(
              "flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-cyan-500 transition-all duration-200",
              loading && "animate-pulse"
            )}
            onClick={handleWithdraw}
          >
            <Minus className="mr-2 h-4 w-4" /> Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
};
