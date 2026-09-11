"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { robinhoodClient } from "@/lib/robinhood";
type Leader = {
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
          { name: "pool", type: "address" },
          { name: "positionTokenId", type: "uint256" },
          { name: "initialEth", type: "uint256" },
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
    name: "currentMarketCapUsd",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256" }],
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
export function SiteMarketLeaders() {
  const [leaders, setLeaders] = useState<Leader[]>([]),
    [live, setLive] = useState(false);
  useEffect(() => {
    const factory = process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS as
        | `0x${string}`
        | undefined,
      oracle = process.env.NEXT_PUBLIC_DAILY_ORACLE_ADDRESS as
        | `0x${string}`
        | undefined;
    if (!factory || !oracle) return;
    async function load() {
      try {
        const count = await robinhoodClient.readContract({
          address: factory!,
          abi: factoryAbi,
          functionName: "launchCount",
        });
        const start = count > 100n ? count - 100n : 0n;
        const launches = await Promise.all(
          Array.from({ length: Number(count - start) }, (_, i) =>
            robinhoodClient.readContract({
              address: factory!,
              abi: factoryAbi,
              functionName: "getLaunch",
              args: [start + BigInt(i)],
            })
          )
        );
        const rows = await Promise.all(
          launches.map(async (l) => ({
            token: l.token,
            creator: l.creator,
            name: l.name,
            ticker: l.ticker,
            cap: await robinhoodClient.readContract({
              address: oracle!,
              abi: oracleAbi,
              functionName: "currentMarketCapUsd",
              args: [l.token],
            }),
          }))
        );
        setLeaders(rows.sort((a, b) => (a.cap > b.cap ? -1 : 1)).slice(0, 5));
        setLive(true);
      } catch {
        setLive(false);
      }
    }
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black">▥ &nbsp; TOP 5 MARKET CAP</h2>
          <p className="mt-1 text-[11px] text-white/40">
            Tokens launched on MEME//BORN ·{" "}
            {live ? "LIVE ONCHAIN" : "CONNECTING TO CHAIN"}
          </p>
        </div>
        <span
          className={`h-2 w-2 rounded-full ${
            live ? "bg-[#78f2a4]" : "bg-amber-400"
          }`}
        />
      </div>
      <div className="mt-4">
        {live && leaders.length === 0 && (
          <div className="border-t border-white/[.06] py-8 text-center text-xs text-white/35">
            No MEME//BORN tokens yet.
          </div>
        )}
        {leaders.map((t, i) => (
          <Link
            href={t.token.startsWith("0x") ? `/token/${t.token}` : "/born"}
            className="grid grid-cols-[24px_1fr_92px] items-center gap-2 border-t border-white/[.06] py-3 text-xs"
            key={t.token}
          >
            <span className="text-white/35">{i + 1}</span>
            <div>
              <b>{t.name}</b>
              <span className="block text-[9px] text-white/35">
                ${t.ticker}
              </span>
            </div>
            <b className="text-right text-[#78f2a4]">{money(t.cap)}</b>
          </Link>
        ))}
      </div>
    </div>
  );
}
