"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { Globe2 } from "lucide-react";
export function Navbar() {
  const pathname = usePathname();
  const { address, setWalletOpen, restoreWallet } = useAppStore();
  useEffect(() => {
    restoreWallet();
  }, [restoreWallet]);
  return (
    <header className="sticky top-0 z-40 border-b border-white/[.07] bg-[#060807]/90 backdrop-blur-xl">
      <div className="container flex h-[72px] items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-black tracking-[-.05em]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm text-black">
            M
          </span>
          MEME<span className="lime">//</span>BORN
        </Link>
        <nav className="desktop-nav flex gap-8 text-[11px] font-bold">
          {[
            ["/", "HOME"],
            ["/create", "CREATE"],
            ["/leaderboard", "RANKING"],
            ["/born", "BORN"],
            ["/how-it-works", "DOCS"],
          ].map(([href, label]) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`transition-colors ${
                  active
                    ? "text-[#78f2a4]"
                    : "text-white/45 hover:text-white/75"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <div className="desktop-nav btn h-10 py-0 text-[11px]">
            <Globe2 size={14} />
            <span>ROBINHOOD MAINNET</span>
            <i className="h-1.5 w-1.5 rounded-full bg-[#b8ff3d] shadow-[0_0_8px_#b8ff3d]" />
          </div>
          <button
            className="btn btn-primary h-10 py-0 text-[11px]"
            onClick={() => setWalletOpen(true)}
          >
            {address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "CONNECT WALLET"}
          </button>
        </div>
      </div>
    </header>
  );
}
