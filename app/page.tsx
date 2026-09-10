import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { ExploreLaunches } from "@/components/market/explore-launches";

export default function Home() {
  return (
    <div className="container">
      <section className="brew-hero">
        <div className="relative z-10 max-w-3xl">
          <div className="brew-kicker">
            <Sparkles size={14} /> BUILT FOR YOUR NEXT BIG MEME
          </div>
          <h1>
            A little idea.
            <br />
            <span>A token community.</span>
          </h1>
          <p>
            Launch community tokens on Robinhood Chain, discover what is
            growing, and follow every creation onchain.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/create" className="brew-primary">
              CREATE A TOKEN <ArrowUpRight size={16} />
            </Link>
            <Link href="/how-it-works" className="brew-secondary">
              HOW IT WORKS
            </Link>
          </div>
        </div>
        <div className="brew-orbit" aria-hidden="true">
          <div className="brew-orbit-core">
            M<span>//</span>B
          </div>
        </div>
      </section>
      <div className="brew-proof">
        <span>
          <i className="live-dot" /> ROBINHOOD MAINNET
        </span>
        <span>
          <ShieldCheck size={15} /> PERMISSIONLESS LAUNCHES
        </span>
        <span>1M BORN DAILY CREATOR REWARD</span>
      </div>
      <ExploreLaunches />
    </div>
  );
}
