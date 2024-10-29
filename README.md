# [Marcos Gaius] Basic dApp for RWA Investing

## Description

There are two contracts, built upon openzeppelin library. One ERC20 representing a RWA called BLTM and a Liquidity Pool which allows users to swap BLTM for USDC and vice-versa. There's a dApp which allows, in a user-friendly and web3 themed way, the user to interact with the contracts.

**Deployment at**: https://dapp-blank-labs.vercel.app/

## Technologies Used

- Smart Contracts: OpenZeppelin contracts, Hardhat for development, testing, and deployment, and Viem for blockchain interactions.

- Frontend: NextJS 14, TailwindCSS, Shadcn for styling, and Typechain for generating TypeScript types from contract ABIs.

- Wallet Integration: WalletConnect for wallet provider, and ethers.js v6 for interacting with the smart contracts.
  RPC Provider: Alchemy RPC provider for a dedicated RPC node.

## Setup Instructions

### Contract

Make sure you have the dependencies installed:

```js
yarn install
```

**Testing:**

To test both contracts (ERC20 and Liquidity Pool) run the command below:

```js
npx hardhat test --network hardhat
```

**Deploying:**

The project is configured to deploy on polygon amoy testnet and it's using a public node. If you want to change the network or use a private RPC _(infura, alchemy, etc)_, adjust as wanted in the `hardhat.config.ts` file.

To to deploy the contract, follow the steps:

1. See the available variables to set: `npx hardhat vars setup`
2. Currently, only the deployer private key needs to be set: `npx hardhat vars set AMOY_PRIVATE_KEY`
3. The command above will ask for the value to be set. Insert it and confirm.
4. Deploy with: `npx hardhat run scripts/index.ts` (it might take a while)

### App (frontend)

**Testing:**

**Running:**

1. Make sure to have a `.env` file based on the `.env.example` with the values filled.
2. Run `yarn install` to install the dependencies
3. Run `yarn dev` for development
4. Run `yarn build` followed by `yarn start` to run the production version!

## Approach and Challlenges

### Approach

The dApp is designed to facilitate the swapping of stablecoins (USDC) with a custom ERC-20 token (BLTM) representing ownership in a real-world asset (RWA). The solution is divided into two main components:

Smart Contracts: Implementing ERC20 functionality and a Liquidity Pool contract.
Frontend Interface: Offering a user-friendly experience to interact with these contracts.

### Challenges and Improvements

1. AccessControlDefaultAdminRules would be a safer choice on roles and permissions.

2. Did not use OpenZeppelin’s ERC20Burnable to keep burn rights restricted to the MINTER role.

3. Would use tailwind-variants for more efficient management of style states (e.g., loading, errors).

4. Plan optimistic updates for better feedback on balance changes during withdrawals and deposits.

5. Toasts for transaction feedback, including loading indicators and error messages.

6. Allowance would be great and more secure to the ERC20 BLTM contract.

7. Would implement pagination for perfomance and develop a way to fetch more than 45k blocks in the past.

8. Would consolidate swap events into a single event to simplify event handling.

9. Event listener for withdrawal and deposit need fix to work correctly.

10. Need to develop tests for the UI to ensure proper functionality.
