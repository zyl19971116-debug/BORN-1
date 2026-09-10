import { PreviousDayRanking } from "@/components/market/previous-day-ranking";

export default function Leaderboard() {
  return (
    <section className="container py-20">
      <div className="eyebrow">DAILY MARKET CAP FINAL</div>
      <h1 className="section-title mt-3">YESTERDAY&apos;S TOP TOKENS</h1>
      <p className="muted mt-4">
        The previous day&apos;s highest market-cap tokens launched through
        MEME//BORN.
      </p>
      <PreviousDayRanking />
    </section>
  );
}
