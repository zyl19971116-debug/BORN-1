"use client";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { bornMemes } from "@/data/memes";
import { robinhoodClient } from "@/lib/robinhood";

type Sort = "trending" | "market" | "new";
type Token = {
  id: number;
  address?: string;
  name: string;
  ticker: string;
  image: string;
  imagePosition?: string;
  marketCap?: string;
  holders?: number;
  createdAt?: number;
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
function metadataImage(uri: string) {
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

export function ExploreLaunches() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("trending");
  const [onchain, setOnchain] = useState<Token[]>([]);
  useEffect(() => {
    const factory = process.env.NEXT_PUBLIC_COMMUNITY_FACTORY_ADDRESS as
      | `0x${string}`
      | undefined;
    if (!factory) return;
    async function load() {
      try {
        const count = await robinhoodClient.readContract({
          address: factory!,
          abi: factoryAbi,
          functionName: "launchCount",
        });
        const start = count > 48n ? count - 48n : 0n;
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
        setOnchain(
          launches
            .reverse()
            .map((item, i) => ({
              id: 100000 + i,
              address: item.token,
              name: item.name,
              ticker: item.ticker,
              image: metadataImage(item.metadataURI) || "/hero-egg.png",
              marketCap: "INDEXING",
              createdAt: Number(item.createdAt),
            }))
        );
      } catch {
        /* use demo fallback */
      }
    }
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);
  const tokens = useMemo(() => {
    const source: Token[] = onchain.length ? onchain : bornMemes;
    const filtered = source.filter((token) =>
      `${token.name} ${token.ticker} ${token.address || ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    return [...filtered].sort((a, b) =>
      sort === "new"
        ? (b.createdAt ?? b.id) - (a.createdAt ?? a.id)
        : (b.holders ?? 0) - (a.holders ?? 0)
    );
  }, [query, sort, onchain]);

  return (
    <section className="brew-explore">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="eyebrow">TOKENS LAUNCHED ON MEME//BORN</div>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-.05em]">
            Explore
          </h2>
          <p className="mt-2 text-sm text-white/40">
            Discover community tokens created directly on Robinhood Chain.
          </p>
        </div>
        <Link href="/create" className="brew-primary">
          + CREATE TOKEN
        </Link>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="brew-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, ticker or contract"
          />
        </label>
        <button className="brew-filter" aria-label="Filters">
          <SlidersHorizontal size={17} />
        </button>
      </div>
      <div className="mt-5 flex gap-2 overflow-x-auto">
        {(
          [
            ["trending", "Trending"],
            ["market", "Market cap"],
            ["new", "New"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setSort(value)}
            className={`brew-tab ${sort === value ? "is-active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tokens.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tokens.slice(0, 12).map((token, index) => (
            <Link
              href={
                token.address ? `/token/${token.address}` : `/meme/${token.id}`
              }
              className="brew-token-card"
              key={token.address || token.id}
            >
              <div
                className="brew-token-art"
                style={{
                  backgroundImage: `linear-gradient(to top,rgba(8,9,7,.9),transparent 55%),url(${token.image})`,
                  backgroundPosition: token.imagePosition,
                  backgroundSize: token.image.includes("grid")
                    ? "300% 300%"
                    : "cover",
                }}
              >
                <span className="brew-rank">#{index + 1}</span>
                <span className="brew-chain">RH</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{token.name}</h3>
                    <p className="mt-1 text-xs text-white/40">
                      ${token.ticker}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#ddca97]">
                    {onchain.length ? "ONCHAIN" : "DEMO"}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[.07] pt-3 text-xs">
                  <div>
                    <span className="block text-[10px] text-white/35">
                      MARKET CAP
                    </span>
                    <b>{token.marketCap || "INDEXING"}</b>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/35">
                      HOLDERS
                    </span>
                    <b>{token.holders?.toLocaleString() || "—"}</b>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card mt-5 p-16 text-center text-white/45">
          No matching tokens.
        </div>
      )}
    </section>
  );
}
