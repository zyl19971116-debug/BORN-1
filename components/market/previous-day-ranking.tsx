"use client";
import { useEffect, useState } from "react";
import { robinhoodClient } from "@/lib/robinhood";

type Row = {
  token: string;
  creator: string;
  name: string;
  ticker: string;
  cap: bigint;
};
const factoryAbi = [
  {
    type: "function",
    name: "launchCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getLaunch",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "token", type: "address" },
          { name: "creator", type: "address" },
          { name: "name", type: "string" },
          { name: "ticker", type: "string" },
          { name: "metadataURI", type: "string" },
          { name: "createdAt", type: "uint256" },
        ],
      },
    ],
  },
] as const;
const oracleAbi = [
  {
    type: "function",
    name: "getDailyRanking",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "address[]" }, { type: "uint256[]" }],
  },
] as const;
function money(v: bigint) {
  const n = Number(v) / 1e8;
  return n >= 1e9
    ? `$${(n / 1e9).toFixed(2)}B`
    : n >= 1e6
    ? `$${(n / 1e6).toFixed(1)}M`
    : `$${n.toLocaleString()}`;
}
function short(a: string) {
  return a.startsWith("0x") && a.length > 16
    ? `${a.slice(0, 8)}...${a.slice(-6)}`
    : a;
}

export function PreviousDayRanking() {
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const day = Math.floor(Date.now() / 86400000) - 1;
  useEffect(() => {
    const factory = process.env.NEXT_PUBLIC_COMMUNITY_FACTORY_ADDRESS as
      | `0x${string}`
      | undefined;
    const oracle = process.env.NEXT_PUBLIC_DAILY_ORACLE_ADDRESS as
      | `0x${string}`
      | undefined;
    if (!factory || !oracle) {
      setState("error");
      return;
    }
    (async () => {
      try {
        const [tokens, caps] = await robinhoodClient.readContract({
          address: oracle,
          abi: oracleAbi,
          functionName: "getDailyRanking",
          args: [BigInt(day)],
        });
        const count = await robinhoodClient.readContract({
          address: factory,
          abi: factoryAbi,
          functionName: "launchCount",
        });
        const start = count > 200n ? count - 200n : 0n;
        const launches = await Promise.all(
          Array.from({ length: Number(count - start) }, (_, i) =>
            robinhoodClient.readContract({
              address: factory,
              abi: factoryAbi,
              functionName: "getLaunch",
              args: [start + BigInt(i)],
            })
          )
        );
        const byToken = new Map(
          launches.map((item) => [item.token.toLowerCase(), item])
        );
        const ranked = tokens.flatMap((token, i) => {
          const item = byToken.get(token.toLowerCase());
          return item
            ? [
                {
                  token,
                  creator: item.creator,
                  name: item.name,
                  ticker: item.ticker,
                  cap: caps[i],
                },
              ]
            : [];
        });
        setRows(ranked.slice(0, 20));
        setState("ready");
      } catch {
        setState("error");
      }
    })();
  }, [day]);
  const date = new Date(day * 86400000).toISOString().slice(0, 10);
  return (
    <div className="card mt-10 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div>
          <b>{date} · UTC</b>
          <p className="mt-1 text-[11px] text-white/40">
            Final market-cap snapshot for tokens created on MEME//BORN
          </p>
        </div>
        <span
          className={
            state === "ready" ? "lime text-xs" : "text-xs text-amber-400"
          }
        >
          {state === "ready"
            ? "ONCHAIN DATA"
            : state === "loading"
            ? "LOADING"
            : "RPC ERROR"}
        </span>
      </div>
      <div className="grid grid-cols-[50px_1fr_110px] gap-3 border-b border-white/10 p-4 text-[10px] uppercase text-white/35 md:grid-cols-[70px_1fr_180px_140px]">
        <span>Rank</span>
        <span>Token</span>
        <span className="hidden md:block">Creator</span>
        <span className="text-right">Market cap</span>
      </div>
      {state === "ready" && rows.length === 0 && (
        <div className="p-12 text-center text-sm text-white/45">
          No finalized ranking exists for this date.
        </div>
      )}
      {rows.map((row, i) => (
        <div
          key={row.token}
          className="grid grid-cols-[50px_1fr_110px] items-center gap-3 border-b border-white/5 p-4 text-sm md:grid-cols-[70px_1fr_180px_140px]"
        >
          <b className={i < 3 ? "lime" : ""}>#{i + 1}</b>
          <div>
            <b>{row.name}</b>
            <span className="block text-[10px] text-white/35">
              ${row.ticker}
            </span>
          </div>
          <span className="hidden font-mono text-xs text-white/50 md:block">
            {short(row.creator)}
          </span>
          <b className="text-right">{money(row.cap)}</b>
        </div>
      ))}
    </div>
  );
}
