import Image from "next/image";
import Link from "next/link";
import { SiteMarketLeaders } from "@/components/market/site-market-leaders";
import {
  HomeLatestLaunches,
  HomeOnchainStats,
} from "@/components/market/home-onchain-launches";
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
            Launch your meme.
            <br />
            It becomes a token.
          </p>
          <div className="mt-7 flex gap-3">
            <Link href="/create" className="btn btn-primary min-w-44">
              CREATE A TOKEN →
            </Link>
            <Link href="/how-it-works" className="btn min-w-36">
              ◉ &nbsp; HOW IT WORKS
            </Link>
          </div>
          <HomeOnchainStats />
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
          <HomeLatestLaunches />
        </div>
        <SiteMarketLeaders />
      </section>
      <div className="py-14 text-center text-[10px] tracking-[.5em] text-white/35">
        SAME PEOPLE. A BRIGHTER WEB3. · MEME//BORN
      </div>
    </div>
  );
}
