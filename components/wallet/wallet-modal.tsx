"use client";
import { useAppStore } from "@/store/use-app-store";
import { Wallet, X } from "lucide-react";
export function WalletModal() {
  const { walletOpen, setWalletOpen, connect } = useAppStore();
  if (!walletOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
      onClick={() => setWalletOpen(false)}
    >
      <div
        className="card w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">CONNECT WALLET</h2>
          <button onClick={() => setWalletOpen(false)}>
            <X />
          </button>
        </div>
        <p className="muted mt-2 text-sm">
          Connect to create and manage your token.
        </p>
        {["MetaMask", "WalletConnect", "Coinbase Wallet"].map((x) => (
          <button
            key={x}
            onClick={connect}
            className="mt-3 flex w-full items-center gap-3 rounded-xl border border-white/10 p-4 text-left hover:border-lime-300"
          >
            <Wallet size={18} className="lime" />
            {x}
          </button>
        ))}
        <p className="muted mt-5 text-center text-[11px]">
          DEMO MODE · NO REAL TRANSACTION
        </p>
      </div>
    </div>
  );
}
