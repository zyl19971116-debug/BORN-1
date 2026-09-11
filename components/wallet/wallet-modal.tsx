"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { formatEther } from "viem";
import { robinhoodClient } from "@/lib/robinhood";
import {
  Eip1193Provider,
  WalletIdentity,
  useAppStore,
} from "@/store/use-app-store";

type WalletOption = {
  info: WalletIdentity & { uuid: string };
  provider: Eip1193Provider;
};

type LegacyProvider = Eip1193Provider & {
  providers?: LegacyProvider[];
  isMetaMask?: boolean;
  isRabby?: boolean;
  isCoinbaseWallet?: boolean;
};

const METAMASK_X_AVATAR =
  "https://pbs.twimg.com/profile_images/2079082606717779969/DcvmQxfE_400x400.jpg";

function withOfficialWalletArtwork<T extends WalletIdentity>(identity: T): T {
  const isMetaMask =
    identity.rdns?.toLowerCase() === "io.metamask" ||
    identity.name.toLowerCase().includes("metamask");
  return (isMetaMask ? { ...identity, icon: METAMASK_X_AVATAR } : identity) as T;
}

function legacyIdentity(provider: LegacyProvider, index: number) {
  if (provider.isRabby)
    return { name: "Rabby Wallet", rdns: "io.rabby", icon: "/wallets/rabby.svg" };
  if (provider.isCoinbaseWallet)
    return {
      name: "Coinbase Wallet",
      rdns: "com.coinbase.wallet",
      icon: "/wallets/coinbase.svg",
    };
  if (provider.isMetaMask)
    return {
      name: "MetaMask",
      rdns: "io.metamask",
      icon: METAMASK_X_AVATAR,
    };
  return { name: `Browser Wallet ${index + 1}`, rdns: `legacy.${index}` };
}

function WalletLogo({ identity }: { identity: WalletIdentity }) {
  return identity.icon ? (
    <img
      src={identity.icon}
      alt=""
      className="h-10 w-10 rounded-xl object-contain"
    />
  ) : (
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#78f2a4]/10 text-[#78f2a4]">
      <Wallet size={20} />
    </span>
  );
}

export function WalletModal() {
  const {
    address,
    walletProvider,
    walletIdentity,
    walletOpen,
    setWalletOpen,
    connect,
    disconnect,
    restoreWallet,
  } = useAppStore();
  const [options, setOptions] = useState<WalletOption[]>([]);
  const [connecting, setConnecting] = useState("");
  const [error, setError] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const restoreAttempted = useRef(false);

  useEffect(() => {
    const discovered = new Map<string, WalletOption>();
    function publish() {
      setOptions([...discovered.values()]);
    }
    function announce(event: Event) {
      const detail = (event as CustomEvent<WalletOption>).detail;
      if (!detail?.provider || !detail.info) return;
      const info = withOfficialWalletArtwork(detail.info);
      const key = info.rdns || info.uuid;
      discovered.set(key, { ...detail, info });
      publish();
    }
    window.addEventListener("eip6963:announceProvider", announce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    const fallback = window.setTimeout(() => {
      const injected = window.ethereum as LegacyProvider | undefined;
      const providers = injected?.providers?.length
        ? injected.providers
        : injected
        ? [injected]
        : [];
      providers.forEach((provider, index) => {
        const identity = legacyIdentity(provider, index);
        const key = identity.rdns;
        if (!discovered.has(key)) {
          discovered.set(key, {
            info: { ...identity, uuid: key },
            provider,
          });
        }
      });
      publish();
    }, 350);

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("eip6963:announceProvider", announce);
    };
  }, [walletOpen]);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      return;
    }
    robinhoodClient
      .getBalance({ address: address as `0x${string}` })
      .then((value) => setBalance(Number(formatEther(value)).toFixed(4)))
      .catch(() => setBalance(null));
  }, [address]);

  const sortedOptions = useMemo(
    () => [...options].sort((a, b) => a.info.name.localeCompare(b.info.name)),
    [options]
  );

  useEffect(() => {
    if (restoreAttempted.current || address || !options.length) return;
    const saved = window.localStorage.getItem("meme-born-wallet-rdns");
    if (!saved) return;
    const match = options.find(
      (option) => (option.info.rdns || option.info.name) === saved
    );
    if (!match) return;
    restoreAttempted.current = true;
    void restoreWallet(match.provider, match.info);
  }, [address, options, restoreWallet]);

  if (!walletOpen) return null;

  async function handleConnect(option: WalletOption) {
    setConnecting(option.info.uuid);
    setError("");
    try {
      await connect(option.provider, option.info);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Connection cancelled.";
      setError(
        message.includes("User rejected")
          ? "Connection request was rejected in the wallet."
          : message
      );
    } finally {
      setConnecting("");
    }
  }

  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={() => setWalletOpen(false)}
    >
      <div
        className="card w-full max-w-md overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 p-6">
          <div>
            <h2 className="text-xl font-black">
              {address ? "CONNECTED WALLET" : "CONNECT WALLET"}
            </h2>
            <p className="mt-1 text-xs text-white/40">
              Choose a wallet for Robinhood Chain Mainnet
            </p>
          </div>
          <button
            aria-label="Close wallet dialog"
            onClick={() => setWalletOpen(false)}
            className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-6">
          {address && walletProvider && walletIdentity ? (
            <>
              <div className="rounded-2xl border border-[#78f2a4]/30 bg-[#78f2a4]/[.06] p-4">
                <div className="flex items-center gap-3">
                  <WalletLogo identity={walletIdentity} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <b>{walletIdentity.name}</b>
                      <Check className="text-[#78f2a4]" size={14} />
                    </div>
                    <span className="block truncate font-mono text-[11px] text-white/45">
                      {address}
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
                  <div>
                    <span className="block text-[9px] text-white/35">NETWORK</span>
                    <b className="mt-1 block">Robinhood · 4663</b>
                  </div>
                  <div>
                    <span className="block text-[9px] text-white/35">BALANCE</span>
                    <b className="mt-1 block">{balance ?? "—"} ETH</b>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button type="button" onClick={copyAddress} className="btn py-3 text-xs">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "COPIED" : "COPY ADDRESS"}
                </button>
                <a
                  href={`https://robinhoodchain.blockscout.com/address/${address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn py-3 text-xs"
                >
                  EXPLORER <ExternalLink size={14} />
                </a>
              </div>
              <button
                type="button"
                onClick={() => void disconnect()}
                className="btn mt-3 w-full border-red-400/20 py-3 text-xs text-red-300 hover:border-red-400/60"
              >
                <LogOut size={16} /> DISCONNECT WALLET
              </button>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.025] px-3 py-2.5 text-[10px] text-white/45">
                <ShieldCheck className="text-[#78f2a4]" size={15} />
                NON-CUSTODIAL · THE SITE NEVER ACCESSES YOUR PRIVATE KEY
              </div>
              <div className="space-y-2">
                {sortedOptions.map((option) => (
                  <button
                    type="button"
                    disabled={Boolean(connecting)}
                    onClick={() => handleConnect(option)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[.02] p-3 text-left transition hover:border-[#78f2a4]/70 hover:bg-[#78f2a4]/[.04] disabled:opacity-50"
                    key={option.info.uuid}
                  >
                    <WalletLogo identity={option.info} />
                    <span className="min-w-0 flex-1">
                      <b className="block text-sm">{option.info.name}</b>
                      <small className="text-white/35">Browser extension</small>
                    </span>
                    {connecting === option.info.uuid ? (
                      <LoaderCircle className="animate-spin text-[#78f2a4]" size={18} />
                    ) : (
                      <span className="text-white/30">→</span>
                    )}
                  </button>
                ))}
              </div>
              {!sortedOptions.length && (
                <div className="rounded-xl border border-dashed border-white/15 p-7 text-center">
                  <Wallet className="mx-auto text-white/25" size={26} />
                  <b className="mt-3 block text-sm">NO WALLET DETECTED</b>
                  <p className="mt-2 text-xs leading-5 text-white/35">
                    Install MetaMask, Rabby, or Coinbase Wallet, then refresh this page.
                  </p>
                </div>
              )}
            </>
          )}
          {error && (
            <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-xs leading-5 text-red-300">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
