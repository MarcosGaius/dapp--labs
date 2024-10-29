import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppKit } from "../context/web3modal";
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BTLM Swap",
  description: "The best dApp for Blank Labs!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%2210 0 100 100%22><text y=%22.90em%22 font-size=%2290%22>🪙</text></svg>"
        ></link>
      </head>
      <body className={inter.className}>
        <AppKit>
          <main className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-8">
            <Header />
            {children}
          </main>
        </AppKit>
      </body>
    </html>
  );
}
