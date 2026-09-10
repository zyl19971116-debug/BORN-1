"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { robinhoodClient } from "@/lib/robinhood";

type Launch = {
  token: string;
  creator: string;
  name: string;
  ticker: string;
  metadataURI: string;
  createdAt: bigint;
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
    name: "currentMarketCapUsd",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;
function imageFromMetadata(uri: string) {
  try {
    if (!uri.startsWith("data:application/json,")) return "";
    return (
      JSON.parse(decodeURIComponent(uri.slice(uri.indexOf(",") + 1))).image ||
      ""
    );
  } catch {
    return "";
  }
}
function money(value: bigint) {
  if (!value) return "NOT INDEXED";
  const n = Number(value) / 1e8;
  return n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${n.toLocaleString()}`;
}
function short(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function OnchainLaunchList() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [sort, setSort] = useState<"newest" | "market">("newest");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
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
    async function load() {
      try {
        const count = await robinhoodClient.readContract({
          address: factory!,
          abi: factoryAbi,
          functionName: "launchCount",
        });
        const start = count > 200n ? count - 200n : 0n;
        const records = await Promise.all(
          Array.from({ length: Number(count - start) }, (_, i) =>
            robinhoodClient.readContract({
              address: factory!,
              abi: factoryAbi,
              functionName: "getLaunch",
              args: [start + BigInt(i)],
            })
          )
        );
        const withCaps = await Promise.all(
          records.map(async (item) => ({
            ...item,
            cap: await robinhoodClient.readContract({
              address: oracle!,
              abi: oracleAbi,
              functionName: "currentMarketCapUsd",
              args: [item.token],
            }),
          }))
        );
        setLaunches(withCaps);
        setState("ready");
      } catch {
        setState("error");
      }
    }
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);
  const rows = useMemo(
    () =>
      [...launches].sort((a, b) =>
        sort === "market"
          ? a.cap > b.cap
            ? -1
            : 1
          : a.createdAt > b.createdAt
          ? -1
          : 1
      ),
    [launches, sort]
  );
  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["newest", "NEWEST"],
          ["market", "MARKET CAP"],
        ].map(([value, label]) => (
          <button
            onClick={() => setSort(value as "newest" | "market")}
            className={`btn py-2 ${sort === value ? "btn-primary" : ""}`}
            key={value}
          >
            {label}
          </button>
        ))}
      </div>
      {state === "loading" && (
        <div className="card mt-8 p-14 text-center text-white/45">
          READING ROBINHOOD CHAIN…
        </div>
      )}
      {state === "error" && (
        <div className="card mt-8 p-14 text-center text-red-300">
          Unable to read the Robinhood Chain contracts. Please try again.
        </div>
      )}
      {state === "ready" && !rows.length && (
        <div className="card mt-8 p-14 text-center">
          <b>NO TOKENS CREATED YET</b>
          <p className="muted mt-2 text-sm">
            The first confirmed token created through MEME//BORN will appear
            here.
          </p>
          <Link className="btn btn-primary mt-5" href="/create">
            CREATE THE FIRST TOKEN
          </Link>
        </div>
      )}
      {state === "ready" && rows.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((token) => {
            const image = imageFromMetadata(token.metadataURI);
            return (
              <article className="card p-4" key={token.token}>
                <div
                  className="h-44 rounded-2xl bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${image || "/hero-egg.png"})`,
                  }}
                />
                <h3 className="mt-4 truncate font-bold">{token.name}</h3>
                <p className="text-xs text-white/40">${token.ticker}</p>
                <div className="mt-4 border-t border-white/10 pt-4 text-xs">
                  <span className="muted">MARKET CAP</span>
                  <b className="mt-1 block">{money(token.cap)}</b>
                  <span className="muted mt-3 block">
                    CREATOR · {short(token.creator)}
                  </span>
                  <span className="muted mt-1 block">
                    {new Date(Number(token.createdAt) * 1000).toLocaleString()}
                  </span>
                </div>
                <Link
                  className="btn mt-4 w-full"
                  href={`/token/${token.token}`}
                >
                  VIEW ONCHAIN
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
