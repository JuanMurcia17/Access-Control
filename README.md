# OpenZeppelin AccessControl Demo

Academic demonstration of role-based access control (RBAC) in Solidity smart contracts using [OpenZeppelin AccessControl](https://docs.openzeppelin.com/contracts/5.x/access-control), with a modern Next.js frontend.

## Purpose

This project serves as a practical learning resource to understand how **OpenZeppelin's AccessControl** module works in Solidity smart contracts. It demonstrates:

- How to define and manage roles in a smart contract
- How to grant and revoke roles
- How to restrict function access based on roles
- How to interact with the contract from a web frontend

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | Next.js 16 (App Router)                |
| Language   | TypeScript                              |
| Styling    | Tailwind CSS 4                          |
| Linting    | ESLint 9 + eslint-config-next          |
| Contracts  | Solidity + OpenZeppelin Contracts (TBD) |
| Blockchain | Hardhat / Foundry (TBD)                |
| Wallet     | MetaMask / WalletConnect (TBD)         |

## Project Structure

```
openzeppelin-accesscontrol-demo/
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # Reusable React components
│   └── lib/              # Utility functions and helpers
├── contracts/            # Solidity smart contracts
├── scripts/              # Deployment and interaction scripts
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── next.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/JuanMurcia17/openzeppelin-accesscontrol-demo.git

# Navigate to the project directory
cd openzeppelin-accesscontrol-demo

# Install dependencies
npm install
```

### Run in Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Other Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Next Steps

The following features are planned for the next phase of development:

1. **Smart Contract**: Create a Solidity contract using `AccessControl` from OpenZeppelin with custom roles (e.g., `ADMIN_ROLE`, `MINTER_ROLE`, `PAUSER_ROLE`)
2. **Hardhat Setup**: Configure Hardhat for compiling, testing, and deploying the contract
3. **Wallet Integration**: Connect MetaMask or WalletConnect to interact with the contract from the browser
4. **Demo UI**: Build a role management interface to grant, revoke, and check roles in real time
5. **Testnet Deployment**: Deploy the contract to a test network (e.g., Sepolia) with deployment scripts

## License

This project is for academic and educational purposes.


