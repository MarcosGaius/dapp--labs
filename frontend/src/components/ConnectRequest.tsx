"use client";

import { Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWeb3Modal } from "@web3modal/ethers/react";

export const ConnectRequest = () => {
  const { open } = useWeb3Modal();

  return (
    <Card className="w-full max-w-md bg-gray-800 border border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-100 to-cyan-500">
          Connect Your Wallet
        </CardTitle>
        <CardDescription className="text-gray-400">Connect your wallet to access the Blank Labs platform</CardDescription>
      </CardHeader>
      <CardContent className="mt-4">
        <Alert variant="default" className="bg-yellow-500/20 border-yellow-500/50 text-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>Make sure you&apos;re connecting to the correct network (Polygon Amoy) before proceeding.</AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button className="w-full btn-primary text-slate-700" onClick={() => open()}>
          <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
        </Button>
      </CardFooter>
    </Card>
  );
};
