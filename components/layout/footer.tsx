import Link from "next/link";
export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 py-14">
      <div className="container flex flex-col justify-between gap-10 md:flex-row">
        <div>
          <div className="text-xl font-black">
            MEME<span className="lime">//</span>BORN
          </div>
          <p className="mt-4 text-2xl font-bold leading-tight">
            CREATE. GROW. LEAD.
            <br />
            ONE TOKEN.
          </p>
          <p className="muted mt-3 text-sm">
            Community tokens, launched permissionlessly.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-white/60">
          <Link href="/create">Create</Link>
          <Link href="/born">Born</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/how-it-works">How It Works</Link>
          <span>X</span>
          <span>Docs</span>
        </div>
      </div>
    </footer>
  );
}
