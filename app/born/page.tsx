import { bornMemes } from "@/data/memes";
import { BornCard } from "@/components/meme/born-card";
export default function Born() {
  return (
    <section className="container py-20">
      <div className="eyebrow">PERMANENT ONCHAIN RECORD</div>
      <h1 className="section-title mt-3">BORN ONCHAIN</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {["NEWEST", "MARKET CAP", "VOLUME", "HOLDERS", "BIGGEST GAIN"].map(
          (x, i) => (
            <button
              className={`btn py-2 ${i === 0 ? "btn-primary" : ""}`}
              key={x}
            >
              {x}
            </button>
          )
        )}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bornMemes.map((m) => (
          <BornCard key={m.id} meme={m} />
        ))}
      </div>
    </section>
  );
}
