"use client";
import { useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { LoaderCircle, LogOut, Wallet, X } from "lucide-react";

export function WalletModal() {
  const { address, walletOpen, setWalletOpen, connect, disconnect } =
    useAppStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!walletOpen) return null;
  async function handleConnect() {
    setBusy(true);
    setError("");
    try {
      await connect();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Wallet connection was cancelled."
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
      onClick={() => setWalletOpen(false)}
    >
      <div
        className="card w-full max-w-sm p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">
            {address ? "WALLET CONNECTED" : "CONNECT WALLET"}
          </h2>
          <button onClick={() => setWalletOpen(false)}>
            <X />
          </button>
        </div>
        <p className="muted mt-2 text-sm">
          Robinhood Chain Mainnet · Chain ID 4663
        </p>
        {address ? (
          <>
            <div className="mt-5 break-all rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-xs">
              {address}
            </div>
            <button onClick={disconnect} className="btn mt-4 w-full">
              <LogOut size={17} /> DISCONNECT
            </button>
          </>
        ) : (
          <button
            disabled={busy}
            onClick={handleConnect}
            className="mt-5 flex w-full items-center gap-3 rounded-xl border border-white/10 p-4 text-left hover:border-[#78f2a4]"
          >
            {busy ? (
              <LoaderCircle className="lime animate-spin" size={18} />
            ) : (
              <Wallet className="lime" size={18} />
            )}
            <span>
              <b className="block">BROWSER WALLET</b>
              <small className="text-white/35">
                MetaMask, Rabby, Coinbase Wallet
              </small>
            </span>
          </button>
        )}
        {error && (
          <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </p>
        )}
        <p className="muted mt-5 text-center text-[10px]">
          NON-CUSTODIAL · REAL MAINNET TRANSACTIONS
        </p>
      </div>
    </div>
  );
}
