"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { robinhoodClient } from "@/lib/robinhood";

type PoolLaunch = {
  token: `0x${string}`;
  creator: `0x${string}`;
  pool: `0x${string}`;
  positionTokenId: bigint;
  initialEth: bigint;
  name: string;
  ticker: string;
  metadataURI: string;
  createdAt: bigint;
};

const poolFactoryAbi = [
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

function imageFromMetadata(uri: string) {
  try {
    if (!uri.startsWith("data:application/json,")) return "";
    const metadata = JSON.parse(
      decodeURIComponent(uri.slice(uri.indexOf(",") + 1))
    ) as { image?: string };
    return metadata.image || "";
  } catch {
    return "";
  }
}

function age(timestamp: bigint) {
  const seconds = Math.max(
    0,
    Math.floor(Date.now() / 1000) - Number(timestamp)
  );
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function usePoolLaunches() {
  const [launches, setLaunches] = useState<PoolLaunch[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  useEffect(() => {
    const factory = process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS as
      | `0x${string}`
      | undefined;
    if (!factory) {
      setState("error");
      return;
    }

    async function load() {
      try {
        const count = await robinhoodClient.readContract({
          address: factory!,
          abi: poolFactoryAbi,
          functionName: "launchCount",
        });
        const records = await Promise.all(
          Array.from({ length: Number(count) }, (_, index) =>
            robinhoodClient.readContract({
              address: factory!,
              abi: poolFactoryAbi,
              functionName: "getLaunch",
              args: [BigInt(index)],
            })
          )
        );
        setLaunches(records);
        setState("ready");
      } catch {
        setState("error");
      }
    }

    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  return { launches, state };
}

export function HomeOnchainStats() {
  const { launches, state } = usePoolLaunches();
  const count = launches.length;
  const totalEth = launches.reduce((sum, item) => sum + item.initialEth, 0n);
  const loadingValue = state === "loading" ? "…" : "0";
  const stats = [
    [state === "ready" ? count.toLocaleString() : loadingValue, "TOKENS BORN"],
    [state === "ready" ? count.toLocaleString() : loadingValue, "POOLS CREATED"],
    [
      state === "ready" ? Number(formatEther(totalEth)).toLocaleString() : loadingValue,
      "ETH SEEDED",
    ],
    [state === "ready" ? count.toLocaleString() : loadingValue, "LOCKED LP POSITIONS"],
  ];

  return (
    <div className="mt-10 grid max-w-2xl grid-cols-2 gap-y-6 sm:grid-cols-4">
      {stats.map((item, index) => (
        <div
          className={`pr-6 ${
            index ? "sm:border-l sm:border-white/10 sm:pl-6" : ""
          }`}
          key={item[1]}
        >
          <b className="text-lg">{item[0]}</b>
          <span className="mt-1 block text-[9px] tracking-wider text-white/40">
            {item[1]}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HomeLatestLaunches() {
  const { launches, state } = usePoolLaunches();
  const latest = [...launches]
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    .slice(0, 4);

  if (state === "loading") {
    return (
      <div className="mt-5 border-t border-white/[.06] py-12 text-center text-xs text-white/35">
        READING ROBINHOOD CHAIN…
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className="mt-5 border-t border-white/[.06] py-12 text-center text-xs text-red-300/70">
        UNABLE TO READ ROBINHOOD CHAIN
      </div>
    );
  }
  if (!latest.length) {
    return (
      <div className="mt-5 border-t border-white/[.06] py-10 text-center">
        <b className="text-xs">NO TOKENS CREATED YET</b>
        <p className="mt-2 text-[11px] text-white/35">
          The first confirmed Pools launch will appear here.
        </p>
        <Link href="/create" className="btn btn-primary mt-4 px-4 py-2 text-[10px]">
          CREATE THE FIRST TOKEN
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {latest.map((launch) => {
        const image = imageFromMetadata(launch.metadataURI);
        return (
          <Link
            href={`/token/${launch.token}`}
            className="overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2"
            key={launch.token}
          >
            <div
              className="aspect-square rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${image || "/hero-egg.png"})` }}
            />
            <b className="mt-2 block truncate text-xs">{launch.name}</b>
            <span className="text-[9px] text-white/40">
              ${launch.ticker} · {age(launch.createdAt)}
            </span>
            <div className="mt-2 rounded border border-white/10 py-1 text-center text-[9px]">
              VIEW ONCHAIN ↗
            </div>
          </Link>
        );
      })}
    </div>
  );
}
