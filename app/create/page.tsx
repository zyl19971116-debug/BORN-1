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
import { createWalletClient, custom, formatEther, parseEther } from "viem";
import { robinhood, robinhoodClient } from "@/lib/robinhood";
import {
  ensureRobinhoodNetwork,
  useAppStore,
} from "@/store/use-app-store";

const factoryAbi = [
  {
    type: "function",
    name: "createTokenAndPool",
    stateMutability: "payable",
    inputs: [
      { name: "name", type: "string" },
      { name: "ticker", type: "string" },
      { name: "metadataURI", type: "string" },
    ],
    outputs: [
      { type: "address" },
      { type: "address" },
      { type: "uint256" },
    ],
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
  const { address, walletProvider, walletIdentity, setWalletOpen } =
    useAppStore();
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [imageData, setImageData] = useState("");
  const [website, setWebsite] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [initialEth, setInitialEth] = useState("0.005");
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [launchCount, setLaunchCount] = useState<bigint | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );
  useEffect(() => {
    const factory = process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS as
      | `0x${string}`
      | undefined;
    if (!factory) return;
    robinhoodClient
      .readContract({
        address: factory,
        abi: [
          {
            type: "function",
            name: "launchCount",
            stateMutability: "view",
            inputs: [],
            outputs: [{ type: "uint256" }],
          },
        ] as const,
        functionName: "launchCount",
      })
      .then(setLaunchCount)
      .catch(() => setLaunchCount(null));
  }, []);

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
    setStatus("Preparing your pool launch…");
    if (name.trim().length < 2)
      return setStatus("Enter a token name with at least 2 characters.");
    if (ticker.trim().length < 2)
      return setStatus("Enter a token symbol with at least 2 characters.");
    if (!imageData) return setStatus("Choose a token image before launching.");
    let seedLiquidity: bigint;
    try {
      seedLiquidity = parseEther(initialEth);
    } catch {
      return setStatus("Enter a valid initial liquidity amount.");
    }
    if (seedLiquidity < parseEther("0.001"))
      return setStatus("Initial liquidity must be at least 0.001 ETH.");
    const factory = process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS as
      | `0x${string}`
      | undefined;
    if (!factory)
      return setStatus(
        "The Robinhood Pools factory has not been deployed/configured yet."
      );
    if (!walletProvider || !address) {
      setStatus("Connect a wallet before launching your token.");
      setWalletOpen(true);
      return;
    }
    let walletBalance: bigint;
    try {
      walletBalance = await robinhoodClient.getBalance({
        address: address as `0x${string}`,
      });
    } catch {
      return setStatus(
        "Unable to read your Robinhood Chain balance. Check your connection and try again."
      );
    }
    if (walletBalance <= seedLiquidity) {
      return setStatus(
        `Insufficient balance. This launch requires ${initialEth} ETH plus Robinhood Chain gas. Your wallet balance is ${Number(
          formatEther(walletBalance)
        ).toFixed(6)} ETH.`
      );
    }
    setBusy(true);
    setHash("");
    try {
      await ensureRobinhoodNetwork(walletProvider);
      setStatus("Confirm the token and liquidity pool launch in your wallet…");
      const client = createWalletClient({
        account: address as `0x${string}`,
        chain: robinhood,
        transport: custom(walletProvider),
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
        functionName: "createTokenAndPool",
        args: [name.trim(), ticker.trim().toUpperCase(), metadata],
        value: seedLiquidity,
      });
      setHash(tx);
      setStatus(
        "Transaction submitted. Waiting for Robinhood Chain confirmation…"
      );
      await robinhoodClient.waitForTransactionReceipt({ hash: tx });
      setStatus(
        "Token and permanently locked ETH pool created. It will appear in Explore automatically."
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Transaction cancelled");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container py-10">
      <div className="mx-auto max-w-2xl">
        <form onSubmit={submit} noValidate className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <h2 className="text-xl font-black">
                MEME//BORN · CREATE TOKEN{" "}
                <span className="ml-2 rounded-full bg-[#78f2a4] px-2 py-1 text-[10px] text-black">
                  0% PLATFORM FEE
                </span>
              </h2>
              <p className="mt-1 text-[11px] text-white/35">
                {launchCount === null
                  ? "READING ONCHAIN…"
                  : `${launchCount.toLocaleString()} TOKENS CREATED`}
              </p>
            </div>
            <X className="text-white/35" size={22} />
          </div>
          <div className="space-y-6 p-6">
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-4">
              <div className="flex items-center justify-between">
                <b className="text-sm text-[#78f2a4]">LATEST FEATURE UPDATE</b>
                <span className="lime text-xs">VIEW DOCS ↗</span>
              </div>
              <p className="mt-2 truncate text-xs text-white/45">
                One wallet confirmation creates your token and a permanently
                locked ETH liquidity pool.
              </p>
            </div>
            <div>
              <div className="mb-3 text-xs font-bold text-white/55">
                CHOOSE IMAGE{" "}
                <span className="font-normal text-white/35">
                  · drag, upload or paste
                </span>
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
                  IMAGE LIBRARY
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
                placeholder="Search a token or paste an image URL"
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
            <div>
              <div className="mb-3 flex items-center justify-between text-xs font-bold text-white/55">
                <span>PLATFORM</span>
                <span className="lime">⚡ ROBINHOOD</span>
              </div>
              <div className="rounded-xl border border-[#78f2a4] bg-[#78f2a4]/10 p-4 text-center">
                <b className="lime">POOLS</b>
                <span className="mt-1 block text-[10px] text-white/40">
                  ETH PAIR · LP PERMANENTLY LOCKED
                </span>
              </div>
            </div>
            <label className="block text-xs font-bold text-white/55">
              INITIAL LIQUIDITY
              <span className="float-right font-normal text-white/35">
                MIN 0.001 ETH
              </span>
              <div className="relative mt-2">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.001"
                  step="0.001"
                  value={initialEth}
                  onChange={(e) => setInitialEth(e.target.value)}
                  required
                  className="pr-14"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40">
                  ETH
                </span>
              </div>
              <span className="mt-2 block font-normal leading-5 text-white/30">
                Your ETH and the full token supply seed a Uniswap V3 pool. The
                LP position cannot be withdrawn after launch.
              </span>
            </label>
            <button
              type="submit"
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
                  {address && walletProvider
                    ? "CREATE TOKEN & POOL"
                    : "CONNECT WALLET TO LAUNCH"}{" "}
                  <Rocket size={17} />
                </>
              )}
            </button>
            {address && walletProvider && (
              <button
                type="button"
                onClick={() => setWalletOpen(true)}
                className="mx-auto flex items-center gap-2 text-[10px] text-white/40 transition hover:text-white/70"
              >
                {walletIdentity?.icon && (
                  <img
                    src={walletIdentity.icon}
                    alt=""
                    className="h-4 w-4 rounded object-contain"
                  />
                )}
                {walletIdentity?.name || "Wallet"} · {address.slice(0, 6)}…
                {address.slice(-4)}
              </button>
            )}
            {status && (
              <div
                aria-live="polite"
                className="relative rounded-xl border border-white/10 bg-white/[.035] p-4 pr-10 text-xs text-white/65"
              >
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
          Launching creates an ERC-20 token and a permanently locked Uniswap V3
          pool on Robinhood Chain. It does not list the token in the Robinhood
          brokerage app or guarantee token value or trading demand.
        </p>
      </div>
    </section>
  );
}
