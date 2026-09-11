import { TradePanel } from "@/components/trading/trade-panel";
export default async function Token({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <section className="container py-20">
      <div className="eyebrow">TOKEN MARKET</div>
      <h1 className="section-title mt-3">
        ${address.slice(0, 6).toUpperCase()}
      </h1>
      <div className="mt-5 rounded-xl border border-[#78f2a4]/20 bg-[#78f2a4]/[.05] p-4">
        <span className="text-[9px] font-black tracking-[.16em] text-[#78f2a4]">
          TOKEN CA
        </span>
        <a
          href={`https://robinhoodchain.blockscout.com/token/${address}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block break-all font-mono text-sm text-white/75 hover:text-[#78f2a4]"
        >
          {address} ↗
        </a>
      </div>
      <TradePanel ticker={address.slice(0, 6).toUpperCase()} />
    </section>
  );
}
