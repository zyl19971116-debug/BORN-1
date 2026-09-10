import Link from "next/link";
const steps = [
  [
    "01",
    "CONNECT WALLET",
    "Your wallet is your identity. No account required.",
  ],
  [
    "02",
    "CREATE A MEME TOKEN",
    "Choose a name, ticker and artwork, then launch it from your wallet.",
  ],
  [
    "03",
    "GROW ITS MARKET CAP",
    "Every token launched here appears in the live market-cap ranking.",
  ],
  [
    "04",
    "WIN 1M BORN DAILY",
    "At 00:00 UTC, the previous day's top token creator receives 1M BORN.",
  ],
];
export default function How() {
  return (
    <section className="container py-20">
      <div className="eyebrow">CONSENSUS IN FOUR STEPS</div>
      <h1 className="section-title mt-3">
        THE INTERNET DECIDES
        <br />
        WHAT GETS BORN.
      </h1>
      <div className="mt-16 grid gap-4 md:grid-cols-2">
        {steps.map((s) => (
          <div className="card p-8" key={s[0]}>
            <span className="font-mono text-4xl font-black text-white/15">
              {s[0]}
            </span>
            <h2 className="mt-10 text-2xl font-bold">{s[1]}</h2>
            <p className="muted mt-2">{s[2]}</p>
          </div>
        ))}
      </div>
      <div className="mt-20 text-center">
        <h2 className="text-3xl font-black">
          PERMISSIONLESS CREATION.
          <br />
          LIVE ONCHAIN MARKET CAPS.
          <br />
          <span className="lime">THE MARKET DECIDES.</span>
        </h2>
        <Link className="btn btn-primary mt-8" href="/create">
          CREATE A TOKEN
        </Link>
      </div>
    </section>
  );
}
