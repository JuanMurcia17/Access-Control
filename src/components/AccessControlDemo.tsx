"use client";

import { useState, useCallback } from "react";
import { BrowserProvider, Contract, ContractFactory, isAddress, Signer } from "ethers";
import contractData from "@/lib/contract.json";

function getSignedContract(contract: Contract, signer: Signer): Contract {
  return new Contract(contract.target as string, contractData.abi, signer);
}

type LogEntry = {
  message: string;
  type: "success" | "error" | "info";
  timestamp: Date;
};

// Role constants (keccak256 hashes)
const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
const BURNER_ROLE =
  "0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848";
const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export default function AccessControlDemo() {
  // Wallet state
  const [account, setAccount] = useState<string>("");
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  // Contract state
  const [contract, setContract] = useState<Contract | null>(null);
  const [contractAddress, setContractAddress] = useState<string>("");
  const [isDeploying, setIsDeploying] = useState(false);

  // Role management state
  const [roleAddress, setRoleAddress] = useState<string>("");

  // Restricted functions state
  const [mintAddress, setMintAddress] = useState<string>("");
  const [burnAddress, setBurnAddress] = useState<string>("");

  // Stats
  const [totalMinted, setTotalMinted] = useState<number>(0);
  const [totalBurned, setTotalBurned] = useState<number>(0);

  // Activity log
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Loading states
  const [loading, setLoading] = useState<string>("");

  const addLog = useCallback(
    (message: string, type: "success" | "error" | "info") => {
      setLogs((prev) => [{ message, type, timestamp: new Date() }, ...prev]);
    },
    []
  );

  const refreshStats = useCallback(
    async (c: Contract) => {
      try {
        const minted = await c.totalMinted();
        const burned = await c.totalBurned();
        setTotalMinted(Number(minted));
        setTotalBurned(Number(burned));
      } catch (err) {
        console.error("Error refreshing stats:", err);
      }
    },
    []
  );

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      addLog(
        "MetaMask no detectado. Por favor instala MetaMask.",
        "error"
      );
      return;
    }

    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      setProvider(browserProvider);
      setAccount(accounts[0]);
      addLog(`Wallet conectada: ${accounts[0]}`, "success");
    } catch (err) {
      addLog(
        `Error al conectar wallet: ${err instanceof Error ? err.message : String(err)}`,
        "error"
      );
    }
  };

  // Deploy contract
  const deployContract = async () => {
    if (!provider) {
      addLog("Conecta tu wallet primero", "error");
      return;
    }

    setIsDeploying(true);
    addLog("Desplegando contrato...", "info");

    try {
      const signer = await provider.getSigner();
      const factory = new ContractFactory(
        contractData.abi,
        contractData.bytecode,
        signer
      );
      const deployed = await factory.deploy();
      await deployed.waitForDeployment();
      const address = await deployed.getAddress();

      setContract(deployed as Contract);
      setContractAddress(address);
      await refreshStats(deployed as Contract);
      addLog(`Contrato desplegado en: ${address}`, "success");
    } catch (err) {
      addLog(
        `Error al desplegar: ${err instanceof Error ? err.message : String(err)}`,
        "error"
      );
    } finally {
      setIsDeploying(false);
    }
  };

  // Grant role
  const grantRole = async (role: string, roleName: string) => {
    if (!contract) {
      addLog("Despliega el contrato primero", "error");
      return;
    }
    if (!isAddress(roleAddress)) {
      addLog("Dirección inválida", "error");
      return;
    }

    setLoading(`grant-${roleName}`);
    try {
      const signer = await provider!.getSigner();
      const signed = getSignedContract(contract, signer);
      const tx = await signed.grantRole(role, roleAddress);
      await tx.wait();
      addLog(`Rol ${roleName} otorgado a ${roleAddress}`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("AccessControlUnauthorizedAccount")) {
        addLog(
          `No tienes permiso para otorgar el rol ${roleName}. Solo el admin puede hacerlo.`,
          "error"
        );
      } else {
        addLog(`Error al otorgar rol: ${msg}`, "error");
      }
    } finally {
      setLoading("");
    }
  };

  // Revoke role
  const revokeRole = async (role: string, roleName: string) => {
    if (!contract) {
      addLog("Despliega el contrato primero", "error");
      return;
    }
    if (!isAddress(roleAddress)) {
      addLog("Dirección inválida", "error");
      return;
    }

    setLoading(`revoke-${roleName}`);
    try {
      const signer = await provider!.getSigner();
      const signed = getSignedContract(contract, signer);
      const tx = await signed.revokeRole(role, roleAddress);
      await tx.wait();
      addLog(`Rol ${roleName} revocado de ${roleAddress}`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("AccessControlUnauthorizedAccount")) {
        addLog(
          `No tienes permiso para revocar el rol ${roleName}. Solo el admin puede hacerlo.`,
          "error"
        );
      } else {
        addLog(`Error al revocar rol: ${msg}`, "error");
      }
    } finally {
      setLoading("");
    }
  };

  // Check role
  const checkRole = async (role: string, roleName: string) => {
    if (!contract) {
      addLog("Despliega el contrato primero", "error");
      return;
    }
    if (!isAddress(roleAddress)) {
      addLog("Dirección inválida", "error");
      return;
    }

    try {
      const hasIt = await contract.hasRole(role, roleAddress);
      addLog(
        `${roleAddress} ${hasIt ? "TIENE" : "NO tiene"} el rol ${roleName}`,
        hasIt ? "success" : "info"
      );
    } catch (err) {
      addLog(
        `Error al verificar rol: ${err instanceof Error ? err.message : String(err)}`,
        "error"
      );
    }
  };

  // Mint
  const executeMint = async () => {
    if (!contract) {
      addLog("Despliega el contrato primero", "error");
      return;
    }
    if (!isAddress(mintAddress)) {
      addLog("Dirección destino inválida", "error");
      return;
    }

    setLoading("mint");
    try {
      const signer = await provider!.getSigner();
      const signed = getSignedContract(contract, signer);
      const tx = await signed.mint(mintAddress);
      await tx.wait();
      await refreshStats(contract);
      addLog(`Mint ejecutado hacia ${mintAddress}`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("AccessControlUnauthorizedAccount")) {
        addLog(
          "No tienes permiso para ejecutar mint. Necesitas el rol MINTER_ROLE.",
          "error"
        );
      } else {
        addLog(`Error al ejecutar mint: ${msg}`, "error");
      }
    } finally {
      setLoading("");
    }
  };

  // Burn
  const executeBurn = async () => {
    if (!contract) {
      addLog("Despliega el contrato primero", "error");
      return;
    }
    if (!isAddress(burnAddress)) {
      addLog("Dirección origen inválida", "error");
      return;
    }

    setLoading("burn");
    try {
      const signer = await provider!.getSigner();
      const signed = getSignedContract(contract, signer);
      const tx = await signed.burn(burnAddress);
      await tx.wait();
      await refreshStats(contract);
      addLog(`Burn ejecutado desde ${burnAddress}`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("AccessControlUnauthorizedAccount")) {
        addLog(
          "No tienes permiso para ejecutar burn. Necesitas el rol BURNER_ROLE.",
          "error"
        );
      } else {
        addLog(`Error al ejecutar burn: ${msg}`, "error");
      }
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-4xl py-8 px-4 sm:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            OpenZeppelin AccessControl Demo
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Demostración interactiva de control de acceso basado en roles
          </p>
        </div>

        {/* A. Connect Wallet */}
        <section className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">
            1. Conectar Wallet
          </h2>
          {!account ? (
            <button
              onClick={connectWallet}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Conectar MetaMask
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Conectado:{" "}
                <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">
                  {account}
                </code>
              </span>
            </div>
          )}
        </section>

        {/* C & D. Deploy Contract */}
        <section className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">
            2. Desplegar Contrato
          </h2>
          {!contractAddress ? (
            <button
              onClick={deployContract}
              disabled={!account || isDeploying}
              className="rounded-lg bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeploying ? "Desplegando..." : "Desplegar AccessControlDemo"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Contrato desplegado:{" "}
                  <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs break-all">
                    {contractAddress}
                  </code>
                </span>
              </div>
              <div className="flex gap-6 mt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-black dark:text-zinc-50">
                    {totalMinted}
                  </p>
                  <p className="text-xs text-zinc-500">Total Minted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-black dark:text-zinc-50">
                    {totalBurned}
                  </p>
                  <p className="text-xs text-zinc-500">Total Burned</p>
                </div>
              </div>
            </div>
          )}
          {!account && (
            <p className="text-sm text-zinc-500 mt-2">
              Conecta tu wallet primero
            </p>
          )}
        </section>

        {/* E. Role Management */}
        <section className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">
            3. Gestión de Roles
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Dirección del usuario
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={roleAddress}
                onChange={(e) => setRoleAddress(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* MINTER_ROLE */}
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                MINTER_ROLE
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => grantRole(MINTER_ROLE, "MINTER_ROLE")}
                  disabled={!contractAddress || loading === "grant-MINTER_ROLE"}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === "grant-MINTER_ROLE"
                    ? "Otorgando..."
                    : "Otorgar"}
                </button>
                <button
                  onClick={() => revokeRole(MINTER_ROLE, "MINTER_ROLE")}
                  disabled={
                    !contractAddress || loading === "revoke-MINTER_ROLE"
                  }
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === "revoke-MINTER_ROLE"
                    ? "Revocando..."
                    : "Revocar"}
                </button>
                <button
                  onClick={() => checkRole(MINTER_ROLE, "MINTER_ROLE")}
                  disabled={!contractAddress}
                  className="rounded-lg bg-zinc-600 px-4 py-2 text-sm text-white font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verificar
                </button>
              </div>
            </div>

            {/* BURNER_ROLE */}
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                BURNER_ROLE
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => grantRole(BURNER_ROLE, "BURNER_ROLE")}
                  disabled={!contractAddress || loading === "grant-BURNER_ROLE"}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === "grant-BURNER_ROLE"
                    ? "Otorgando..."
                    : "Otorgar"}
                </button>
                <button
                  onClick={() => revokeRole(BURNER_ROLE, "BURNER_ROLE")}
                  disabled={
                    !contractAddress || loading === "revoke-BURNER_ROLE"
                  }
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === "revoke-BURNER_ROLE"
                    ? "Revocando..."
                    : "Revocar"}
                </button>
                <button
                  onClick={() => checkRole(BURNER_ROLE, "BURNER_ROLE")}
                  disabled={!contractAddress}
                  className="rounded-lg bg-zinc-600 px-4 py-2 text-sm text-white font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verificar
                </button>
              </div>
            </div>

            {/* DEFAULT_ADMIN_ROLE */}
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                DEFAULT_ADMIN_ROLE
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    checkRole(DEFAULT_ADMIN_ROLE, "DEFAULT_ADMIN_ROLE")
                  }
                  disabled={!contractAddress}
                  className="rounded-lg bg-zinc-600 px-4 py-2 text-sm text-white font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verificar Admin
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* F. Restricted Functions */}
        <section className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">
            4. Funciones Restringidas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mint */}
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                Mint (requiere MINTER_ROLE)
              </h3>
              <input
                type="text"
                placeholder="Dirección destino 0x..."
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm text-black dark:text-zinc-50 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={executeMint}
                disabled={!contractAddress || loading === "mint"}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === "mint" ? "Ejecutando..." : "Ejecutar Mint"}
              </button>
            </div>

            {/* Burn */}
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                Burn (requiere BURNER_ROLE)
              </h3>
              <input
                type="text"
                placeholder="Dirección origen 0x..."
                value={burnAddress}
                onChange={(e) => setBurnAddress(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm text-black dark:text-zinc-50 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={executeBurn}
                disabled={!contractAddress || loading === "burn"}
                className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm text-white font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === "burn" ? "Ejecutando..." : "Ejecutar Burn"}
              </button>
            </div>
          </div>
        </section>

        {/* Activity Log */}
        <section className="mb-8 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">
            Registro de Actividad
          </h2>
          {logs.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No hay actividad aún. Conecta tu wallet para comenzar.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-4 py-2 text-sm ${
                    log.type === "success"
                      ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : log.type === "error"
                        ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  }`}
                >
                  <span className="text-xs opacity-60 mr-2">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  {log.message}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
