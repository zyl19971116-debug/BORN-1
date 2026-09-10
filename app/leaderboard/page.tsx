const rows = [
  "0x82A7...91AF",
  "0x193B...71DE",
  "0xF02C...43A1",
  "0x771E...C918",
  "0xA891...0EE2",
  "0xB6D2...729A",
  "0x12FF...94AB",
  "0x991A...E821",
];
export default function Leader() {
  return (
    <section className="container py-20">
      <div className="eyebrow">COMMUNITY PREDICTION POWER</div>
      <h1 className="section-title mt-3">MEME PROPHETS</h1>
      <p className="muted mt-4">
        Who is best at predicting each day's winner?
      </p>
      <div className="card mt-10 overflow-hidden">
        <div className="grid grid-cols-[50px_1fr_90px_90px] gap-3 border-b border-white/10 p-4 text-[10px] uppercase text-white/35 md:grid-cols-[70px_1fr_120px_120px_100px_120px]">
          <span>RANK</span>
          <span>WALLET</span>
          <span>VOTES</span>
          <span>WIN RATE</span>
          <span className="hidden md:block">WINS</span>
          <span className="hidden md:block">STREAK</span>
        </div>
        {rows.map((w, i) => (
          <div
            key={w}
            className="grid grid-cols-[50px_1fr_90px_90px] gap-3 border-b border-white/5 p-4 text-sm md:grid-cols-[70px_1fr_120px_120px_100px_120px]"
          >
            <b className={i < 3 ? "lime" : ""}>#{i + 1}</b>
            <span className="font-mono">{w}</span>
            <span>{182 - i * 13}</span>
            <span>{(33.5 - i * 1.7).toFixed(1)}%</span>
            <span className="hidden md:block">{61 - i * 5}</span>
            <span className="hidden md:block">🔥 {Math.max(1, 5 - i)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
