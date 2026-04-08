export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-8 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 text-center">
          OpenZeppelin AccessControl Demo
        </h1>
        <p className="max-w-lg text-lg leading-8 text-zinc-600 dark:text-zinc-400 text-center">
          A practical academic demonstration of role-based access control in
          Solidity smart contracts using{" "}
          <a
            href="https://docs.openzeppelin.com/contracts/5.x/access-control"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenZeppelin AccessControl
          </a>
          .
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mt-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Status
            </h2>
            <p className="mt-2 text-xl font-bold text-black dark:text-zinc-50">
              Base Setup
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Next.js + TypeScript + Tailwind
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Next Step
            </h2>
            <p className="mt-2 text-xl font-bold text-black dark:text-zinc-50">
              Smart Contract
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Deploy AccessControl contract
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50 mb-3">
            Planned Features
          </h2>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Project scaffolding (Next.js, Tailwind, TypeScript)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              Solidity contract with OpenZeppelin AccessControl
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              Wallet connection (MetaMask / WalletConnect)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              Role management UI (grant, revoke, check roles)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              Deployment scripts for testnet
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
