"use client";

import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  LoaderCircle,
  Rocket,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { createWalletClient, custom } from "viem";
import { robinhood, robinhoodClient } from "@/lib/robinhood";

const factoryAbi = [
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
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [imageData, setImageData] = useState("");
  const [website, setWebsite] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  function selectImage(file?: File) {
    if (!file) return;
    if (file.size > 150_000) {
      setStatus(
        "Please choose an image smaller than 150 KB to keep the onchain launch fee reasonable."
      );
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => setImageData(String(reader.result));
    reader.readAsDataURL(file);
    setStatus(
      "Image selected. Token metadata will be generated automatically."
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const factory = process.env.NEXT_PUBLIC_COMMUNITY_FACTORY_ADDRESS as
      | `0x${string}`
      | undefined;
    if (!factory)
      return setStatus(
        "The Robinhood factory contract has not been deployed/configured yet."
      );
    if (!window.ethereum)
      return setStatus(
        "Install an EVM browser wallet such as MetaMask, then connect it."
      );
    if (!imageData) return setStatus("Choose a token image before launching.");
    setBusy(true);
    setHash("");
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as `0x${string}`[];
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1237" }],
        });
      } catch {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x1237",
              chainName: "Robinhood Chain",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
              blockExplorerUrls: ["https://robinhoodchain.blockscout.com"],
            },
          ],
        });
      }
      setStatus("Confirm the token deployment in your wallet…");
      const client = createWalletClient({
        account: accounts[0],
        chain: robinhood,
        transport: custom(window.ethereum),
      });
      const metadata = `data:application/json,${encodeURIComponent(
        JSON.stringify({
          name: name.trim(),
          symbol: ticker.trim().toUpperCase(),
          description: `${name.trim()} was launched permissionlessly on MEME//BORN.`,
          image: imageData,
          external_url: website.trim() || undefined,
          twitter: xUrl.trim() || undefined,
        })
      )}`;
      const tx = await client.writeContract({
        address: factory,
        abi: factoryAbi,
        functionName: "createToken",
        args: [name.trim(), ticker.trim().toUpperCase(), metadata],
      });
      setHash(tx);
      setStatus(
        "Transaction submitted. Waiting for Robinhood Chain confirmation…"
      );
      await robinhoodClient.waitForTransactionReceipt({ hash: tx });
      setStatus(
        "Token created and confirmed. It will appear in Explore automatically."
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Transaction cancelled");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container py-14">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <div className="eyebrow">PERMISSIONLESS LAUNCH</div>
            <h1 className="mt-2 text-4xl font-black tracking-[-.045em]">
              CREATE ON ROBINHOOD
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[#78f2a4]/25 bg-[#78f2a4]/5 px-4 py-2 text-[11px] font-bold text-[#78f2a4] sm:flex">
            <i className="live-dot" /> ROBINHOOD MAINNET
          </div>
        </div>
        <form onSubmit={submit} className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <h2 className="text-xl font-black">Token Launch</h2>
            </div>
            <Rocket className="lime" size={22} />
          </div>
          <div className="space-y-6 p-6">
            <div>
              <div className="mb-3 text-xs font-bold text-white/55">
                CHOOSE TOKEN IMAGE
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-white/20 bg-white/[.025] text-white/45 transition hover:border-[#78f2a4] hover:text-[#78f2a4]"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Token preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center">
                      <span>
                        <Upload className="mx-auto mb-2" size={22} />
                        UPLOAD
                      </span>
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className="aspect-square rounded-xl border border-white/10 bg-white/[.025] text-xs text-white/45"
                >
                  <ImagePlus className="mx-auto mb-2" size={21} />
                  LIBRARY
                </button>
                <button
                  type="button"
                  className="aspect-square rounded-xl border border-white/10 bg-white/[.025] text-xs text-white/45"
                >
                  <Sparkles className="mx-auto mb-2" size={21} />
                  AI IMAGE
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => selectImage(e.target.files?.[0])}
              />
            </div>
            <label className="relative block">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                size={18}
              />
              <input
                className="pl-11"
                placeholder="Search existing token names before launching"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-white/55">
                TOKEN NAME{" "}
                <span className="float-right font-normal text-white/25">
                  {name.length}/40
                </span>
                <input
                  className="mt-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter token name"
                  required
                  minLength={2}
                  maxLength={40}
                />
              </label>
              <label className="block text-xs font-bold text-white/55">
                TOKEN SYMBOL{" "}
                <span className="float-right font-normal text-white/25">
                  {ticker.length}/10
                </span>
                <input
                  className="mt-2 uppercase"
                  value={ticker}
                  onChange={(e) =>
                    setTicker(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))
                  }
                  placeholder="e.g. PEPE"
                  required
                  minLength={2}
                  maxLength={10}
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-white/55">
                X / TWITTER{" "}
                <input
                  className="mt-2"
                  value={xUrl}
                  onChange={(e) => setXUrl(e.target.value)}
                  placeholder="https://x.com/..."
                  maxLength={150}
                />
              </label>
              <label className="block text-xs font-bold text-white/55">
                WEBSITE{" "}
                <input
                  className="mt-2"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  maxLength={150}
                />
              </label>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-xs text-white/45">
              <div className="flex justify-between">
                <span>Network</span>
                <b className="text-white">Robinhood Chain · 4663</b>
              </div>
              <div className="mt-2 flex justify-between">
                <span>Platform fee</span>
                <b className="text-white">0%</b>
              </div>
            </div>
            <button
              disabled={busy}
              className="btn btn-primary h-14 w-full text-sm"
            >
              {busy ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />{" "}
                  SUBMITTING…
                </>
              ) : (
                <>
                  LAUNCH TOKEN ON ROBINHOOD <Rocket size={17} />
                </>
              )}
            </button>
            {status && (
              <div className="relative rounded-xl border border-white/10 bg-white/[.035] p-4 pr-10 text-xs text-white/65">
                <button
                  type="button"
                  onClick={() => setStatus("")}
                  className="absolute right-3 top-3"
                >
                  <X size={14} />
                </button>
                {status}
                {hash && (
                  <a
                    className="lime mt-2 block break-all"
                    href={`https://robinhoodchain.blockscout.com/tx/${hash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    VIEW TRANSACTION ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </form>
        <p className="mx-auto mt-5 max-w-2xl text-center text-[11px] leading-5 text-white/30">
          Launching creates an independent ERC-20 contract on Robinhood Chain.
          It does not list the token in the Robinhood brokerage app or guarantee
          liquidity, price, or trading availability.
        </p>
      </div>
    </section>
  );
}
