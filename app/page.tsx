import Image from "next/image";
import Link from "next/link";
import { LiveRace } from "@/components/voting/live-race";
import { bornMemes } from "@/data/memes";
const trend = [
  { name: "Fartcoin", ticker: "FARTCOIN", cap: "SOL", gain: "HOT" },
  { name: "Bonk", ticker: "BONK", cap: "SOL", gain: "HOT" },
  { name: "dogwifhat", ticker: "WIF", cap: "SOL", gain: "HOT" },
  { name: "Pudgy Penguins", ticker: "PENGU", cap: "SOL", gain: "HOT" },
  { name: "Popcat", ticker: "POPCAT", cap: "SOL", gain: "HOT" },
];
export default function Home() {
  return (
    <div className="container">
      <section className="card relative mt-5 grid min-h-[555px] items-center overflow-hidden px-7 lg:grid-cols-[1.02fr_.98fr] lg:px-12">
        <div className="relative z-10 py-14">
          <div className="eyebrow text-white/55">THE COMMUNITY LAUNCHPAD</div>
          <h1 className="mt-5 max-w-[650px] text-[clamp(44px,5.1vw,76px)] font-black leading-[.89] tracking-[-.065em]">
            MAKE A MEME.
            <br />
            MAKE IT{" "}
            <span className="bg-gradient-to-r from-[#78f2a4] via-[#8fdcff] to-[#c897ff] bg-clip-text text-transparent">
              BORN.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg font-semibold text-white/75">
            Win the day.
            <br />
            It becomes a token.
          </p>
          <div className="mt-7 flex gap-3">
            <Link href="/vote" className="btn btn-primary min-w-44">
              VOTE FOR A MEME →
            </Link>
            <Link href="/how-it-works" className="btn min-w-36">
              ◉ &nbsp; HOW IT WORKS
            </Link>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-y-6 sm:grid-cols-4">
            {[
              ["12,482", "MEMES"],
              ["1,203", "TOKENS BORN"],
              ["428,913", "TOTAL VOTERS"],
              ["∞", "BETTER MEMES"],
            ].map((x, i) => (
              <div
                className={`pr-6 ${
                  i ? "sm:border-l sm:border-white/10 sm:pl-6" : ""
                }`}
                key={x[1]}
              >
                <b className="text-lg">{x[0]}</b>
                <span className="mt-1 block text-[9px] tracking-wider text-white/40">
                  {x[1]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-[430px] self-stretch lg:h-full">
          <div className="absolute inset-16 rounded-full bg-blue-500/10 blur-3xl" />
          <Image
            src="/hero-egg.png"
            alt="Meme core waiting to be born"
            fill
            priority
            className="object-cover object-center opacity-90 mix-blend-screen [mask-image:radial-gradient(ellipse_72%_76%_at_52%_50%,black_42%,transparent_100%)]"
          />
          <div className="absolute right-2 top-24 rotate-[-7deg] font-black italic leading-tight text-white/25 md:text-lg">
            GOOD MEMES
            <br />
            BORN A<br />
            BRIGHTER WEB3.
          </div>
        </div>
      </section>
      <LiveRace />
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black">🚀 &nbsp; JUST BORN</h2>
              <p className="mt-1 text-[11px] text-white/40">
                Latest tokens born from the community.
              </p>
            </div>
            <Link className="btn px-3 py-2 text-[10px]" href="/born">
              VIEW ALL →
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {bornMemes.slice(0, 4).map((m) => (
              <Link
                href={`/meme/${m.id}`}
                className="overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2"
                key={m.id}
              >
                <div
                  className="aspect-square rounded-lg bg-cover"
                  style={{
                    backgroundImage: `url(${m.image})`,
                    backgroundPosition: m.imagePosition,
                    backgroundSize: "300% 300%",
                  }}
                />
                <b className="mt-2 block text-xs">{m.name}</b>
                <span className="text-[9px] text-white/40">
                  ${m.ticker} · {m.bornAgo}
                </span>
                <div className="mt-2 rounded border border-white/10 py-1 text-center text-[9px]">
                  TRADE ↗
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black">▥ &nbsp; TRENDING</h2>
              <p className="mt-1 text-[11px] text-white/40">
                Most traded meme tokens right now.
              </p>
            </div>
            <Link className="btn px-3 py-2 text-[10px]" href="/born">
              VIEW ALL →
            </Link>
          </div>
          <div className="mt-4">
            {trend.map((t, i) => (
              <div
                className="grid grid-cols-[24px_1fr_70px_62px] items-center gap-2 border-t border-white/[.06] py-3 text-xs"
                key={t.ticker}
              >
                <span className="text-white/35">{i + 1}</span>
                <div>
                  <b>{t.name}</b>
                  <span className="block text-[9px] text-white/35">
                    ${t.ticker}
                  </span>
                </div>
                <b className="text-right">{t.cap}</b>
                <b className="text-right text-[#78f2a4]">▲ {t.gain}</b>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="py-14 text-center text-[10px] tracking-[.5em] text-white/35">
        SAME PEOPLE. A BRIGHTER WEB3. · MEME//BORN
      </div>
    </div>
  );
}
