export default async function Profile({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <section className="container py-20">
      <div className="eyebrow">CREATOR PROFILE</div>
      <h1 className="mt-3 break-all font-mono text-3xl font-bold">{address}</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["TOKENS CREATED", "12"],
          ["TOP-10 FINISHES", "6"],
          ["BEST MARKET CAP", "$18.2M"],
          ["BORN REWARDS", "1M"],
        ].map((x) => (
          <div className="card p-6" key={x[0]}>
            <span className="muted text-xs">{x[0]}</span>
            <div className="mt-3 text-3xl font-black">{x[1]}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
