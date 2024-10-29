import { WalletButton } from "./WalletButton";

export const Header = () => {
  return (
    <header className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">
        <span>[🪙] </span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-100 to-cyan-500">bltm token</span>
      </h1>
      <WalletButton />
    </header>
  );
};
