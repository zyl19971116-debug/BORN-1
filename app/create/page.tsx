"use client";
import { useState } from "react";
import { createWalletClient, custom } from "viem";
import { robinhood } from "@/lib/robinhood";
const abi = [
  {
    type: "function",
    name: "createToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "ticker", type: "string" },
      { name: "metadataURI", type: "string" },
    ],
    outputs: [{ type: "address" }],
  },
] as const;
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
    };
  }
}
export default function Create() {
  const [name, setName] = useState(""),
    [ticker, setTicker] = useState(""),
    [uri, setUri] = useState(""),
    [status, setStatus] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const factory = process.env.NEXT_PUBLIC_COMMUNITY_FACTORY_ADDRESS as
      | `0x${string}`
      | undefined;
    if (!factory || !window.ethereum) {
      setStatus("Contract or browser wallet is not configured yet.");
      return;
    }
    try {
      setStatus("Confirm the Robinhood Chain transaction in your wallet…");
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as `0x${string}`[];
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1237" }],
      });
      const client = createWalletClient({
        account: accounts[0],
        chain: robinhood,
        transport: custom(window.ethereum),
      });
      const hash = await client.writeContract({
        address: factory,
        abi,
        functionName: "createToken",
        args: [name, ticker.toUpperCase(), uri],
      });
      setStatus(`Token submitted: ${hash}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Transaction cancelled");
    }
  }
  return (
    <section className="container py-20">
      <div className="mx-auto max-w-2xl">
        <div className="eyebrow">PERMISSIONLESS LAUNCH</div>
        <h1 className="section-title mt-3">CREATE A TOKEN</h1>
        <p className="muted mt-4">
          Every connected wallet can launch a fixed-supply token on Robinhood
          Chain. Its creator becomes eligible for the daily 1M BORN prize.
        </p>
        <form onSubmit={submit} className="card mt-10 space-y-5 p-6">
          <label className="block text-sm">
            TOKEN NAME
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
              required
              minLength={2}
              maxLength={40}
            />
          </label>
          <label className="block text-sm">
            TICKER
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="mt-2"
              required
              minLength={2}
              maxLength={10}
            />
          </label>
          <label className="block text-sm">
            METADATA URI
            <input
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              className="mt-2"
              required
              placeholder="ipfs://.../metadata.json"
            />
            <span className="muted mt-2 block text-[10px]">
              JSON must include an IPFS, Arweave, or HTTPS image field.
            </span>
          </label>
          <button className="btn btn-primary w-full">
            CREATE ON ROBINHOOD CHAIN
          </button>
          {status && (
            <p className="break-all rounded-xl bg-white/5 p-4 text-xs">
              {status}
            </p>
          )}
        </form>
        <div className="card mt-5 p-5 text-xs text-white/50">
          <b className="text-white">DAILY REWARD</b>
          <p className="mt-2">
            At 00:00 UTC, the verified highest-market-cap token created through
            this factory wins. Its creator receives 1,000,000 BORN from the
            reward vault. Market cap is supplied by the protocol oracle and
            cannot be entered by creators.
          </p>
        </div>
      </div>
    </section>
  );
}
