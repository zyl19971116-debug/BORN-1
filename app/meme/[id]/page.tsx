import { notFound } from "next/navigation";
import { memes } from "@/data/memes";
import { TradePanel } from "@/components/trading/trade-panel";
export default async function Detail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    m = memes.find((x) => x.id === Number(id));
  if (!m) notFound();
  return (
    <section className="container py-20">
      <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
        <div
          className="aspect-square rounded-[32px] bg-cover"
          style={{
            backgroundImage: `url(${m.image})`,
            backgroundPosition: m.imagePosition,
            backgroundSize: m.image.includes("grid") ? "300% 300%" : "cover",
          }}
        />
        <div>
          <div className="eyebrow">
            {m.status === "BORN"
              ? "BORN"
              : m.status === "LIVE"
              ? "LIVE RACE"
              : "CANDIDATE POOL"}
          </div>
          <h1 className="mt-3 text-6xl font-black">{m.name}</h1>
          <div className="mt-2 text-2xl text-white/35">${m.ticker}</div>
          <p className="muted mt-6 max-w-xl">{m.description}</p>
          {m.status === "BORN" ? (
            <>
              <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
                {[
                  ["PRICE", m.price],
                  ["MARKET CAP", m.marketCap],
                  ["VOLUME", m.volume],
                  ["HOLDERS", m.holders?.toLocaleString()],
                ].map((x) => (
                  <div className="card p-4" key={x[0]}>
                    <span className="muted text-xs">{x[0]}</span>
                    <b className="mt-2 block">{x[1]}</b>
                  </div>
                ))}
              </div>
              <div className="mt-5 font-mono text-xs text-white/40">
                CONTRACT: {m.address}
              </div>
              <TradePanel ticker={m.ticker} />
            </>
          ) : m.status === "LIVE" ? (
            <div className="card mt-8 p-6">
              <div className="text-3xl font-bold">
                {m.votes.toLocaleString()} VOTES
              </div>
              <p className="muted mt-2">
                Competing for the only token launch in Round #0241.
              </p>
            </div>
          ) : (
            <div className="card mt-8 p-6">Waiting for the next race.</div>
          )}
        </div>
      </div>
    </section>
  );
}
