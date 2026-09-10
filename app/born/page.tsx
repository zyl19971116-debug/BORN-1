import { OnchainLaunchList } from "@/components/market/onchain-launch-list";

export default function Born() {
  return (
    <section className="container py-20">
      <div className="eyebrow">PERMANENT ROBINHOOD CHAIN RECORD</div>
      <h1 className="section-title mt-3">BORN ONCHAIN</h1>
      <p className="muted mt-4">
        Only tokens created through the official MEME//BORN factory are shown
        here. Data refreshes every 15 seconds.
      </p>
      <OnchainLaunchList />
    </section>
  );
}
