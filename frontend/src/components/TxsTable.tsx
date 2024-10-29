import { ChevronUp, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SortFields = "date" | "amount";
type SortDirection = "asc" | "desc";
type FilterType = "all" | "Deposit" | "Withdraw";

export interface Transaction {
  date: string;
  time: string;
  action: string;
  amount: number;
  hash: string;
}

export interface TxsTableProps {
  transactions: Transaction[];
  loading?: boolean;
}

export const TxsTable = ({ transactions, loading }: TxsTableProps) => {
  console.log("transactions:", transactions);
  const [sortColumn, setSortColumn] = useState<SortFields>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterAction, setFilterAction] = useState<FilterType>("all");
  const [filterDate, setFilterDate] = useState("");

  const handleSort = (column: SortFields) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedAndFilteredTransactions = transactions
    .filter((tx) => filterAction === "all" || tx.action === filterAction)
    .filter((tx) => filterDate === "" || tx.date === filterDate)
    .sort((a, b) => {
      const aValue = sortColumn === "amount" ? a.amount : a.date + a.time;
      const bValue = sortColumn === "amount" ? b.amount : b.date + b.time;
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className={cn("bg-gray-800 rounded-xl p-6 shadow-lg border border-purple-500/20", loading && "animate-pulse")}>
      <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
      <div className="flex space-x-4 mb-4">
        <Select value={filterAction} onValueChange={(v) => setFilterAction(v as FilterType)}>
          <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="Deposit">Deposit</SelectItem>
            <SelectItem value="Withdraw">Withdraw</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-700">
              <TableHead className="text-gray-400">
                <Button variant="ghost" onClick={() => handleSort("date")} className="text-gray-400 hover:text-white">
                  Date/Time
                  {sortColumn === "date" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-2 h-4 w-4 inline" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4 inline" />
                    ))}
                </Button>
              </TableHead>
              <TableHead className="text-gray-400">Action</TableHead>
              <TableHead className="text-gray-400">
                <Button variant="ghost" onClick={() => handleSort("amount")} className="text-gray-400 hover:text-white">
                  Amount
                  {sortColumn === "amount" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-2 h-4 w-4 inline" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4 inline" />
                    ))}
                </Button>
              </TableHead>
              <TableHead className="text-gray-400">Transaction Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredTransactions.map((tx, index) => (
              <TableRow key={index} className="border-b border-gray-700">
                <TableCell className="font-medium">
                  {tx.date} {tx.time}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      tx.action === "Deposit" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {tx.action}
                  </span>
                </TableCell>
                <TableCell>{tx.amount} BLTM</TableCell>
                <TableCell className="text-cyan-100">
                  <Link href={`https://amoy.polygonscan.com/tx/${tx.hash}`} target="_blank">
                    {tx.hash}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
