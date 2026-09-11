"use client";

import { create } from "zustand";

export type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export type WalletIdentity = { name: string; icon?: string; rdns?: string };

type AppState = {
  address: string | null;
  walletProvider: Eip1193Provider | null;
  walletIdentity: WalletIdentity | null;
  votedId: number | null;
  voteIncrements: Record<number, number>;
  walletOpen: boolean;
  winnerOpen: boolean;
  connect: (provider: Eip1193Provider, identity: WalletIdentity) => Promise<void>;
  disconnect: () => Promise<void>;
  restoreWallet: (
    provider?: Eip1193Provider,
    identity?: WalletIdentity
  ) => Promise<void>;
  vote: (id: number) => void;
  setWalletOpen: (value: boolean) => void;
  setWinnerOpen: (value: boolean) => void;
};

let activeAccountsListener: ((...args: unknown[]) => void) | null = null;

export async function ensureRobinhoodNetwork(provider: Eip1193Provider) {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x1237" }],
    });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 4902) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x1237",
          chainName: "Robinhood Chain",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
          blockExplorerUrls: ["https://robinhoodchain.blockscout.com"],
        },
      ],
    });
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  address: null,
  walletProvider: null,
  walletIdentity: null,
  votedId: null,
  voteIncrements: {},
  walletOpen: false,
  winnerOpen: false,
  connect: async (provider, identity) => {
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];
    if (!accounts[0]) throw new Error("No account was selected.");
    await ensureRobinhoodNetwork(provider);

    const previousProvider = get().walletProvider;
    if (activeAccountsListener && previousProvider?.removeListener) {
      previousProvider.removeListener("accountsChanged", activeAccountsListener);
    }
    activeAccountsListener = (...args: unknown[]) => {
      const nextAccounts = args[0] as string[] | undefined;
      set({
        address: nextAccounts?.[0] || null,
        ...(nextAccounts?.[0]
          ? {}
          : { walletProvider: null, walletIdentity: null }),
      });
    };
    provider.on?.("accountsChanged", activeAccountsListener);
    window.localStorage.setItem("meme-born-wallet-rdns", identity.rdns || identity.name);
    set({
      address: accounts[0],
      walletProvider: provider,
      walletIdentity: identity,
      walletOpen: false,
    });
  },
  restoreWallet: async (provider, identity) => {
    if (!provider || !identity || get().address) return;
    const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
    if (!accounts[0]) return;
    activeAccountsListener = (...args: unknown[]) => {
      const nextAccounts = args[0] as string[] | undefined;
      set({
        address: nextAccounts?.[0] || null,
        ...(nextAccounts?.[0]
          ? {}
          : { walletProvider: null, walletIdentity: null }),
      });
    };
    provider.on?.("accountsChanged", activeAccountsListener);
    set({
      address: accounts[0],
      walletProvider: provider,
      walletIdentity: identity,
    });
  },
  disconnect: async () => {
    const provider = get().walletProvider;
    if (provider && activeAccountsListener && provider.removeListener) {
      provider.removeListener("accountsChanged", activeAccountsListener);
    }
    try {
      await provider?.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch {
      // Some wallets only support disconnecting the local dapp session.
    }
    activeAccountsListener = null;
    window.localStorage.removeItem("meme-born-wallet-rdns");
    set({
      address: null,
      walletProvider: null,
      walletIdentity: null,
      walletOpen: false,
    });
  },
  vote: (id) =>
    set((state) =>
      state.votedId === null
        ? {
            votedId: id,
            voteIncrements: {
              ...state.voteIncrements,
              [id]: (state.voteIncrements[id] || 0) + 1,
            },
          }
        : {}
    ),
  setWalletOpen: (walletOpen) => set({ walletOpen }),
  setWinnerOpen: (winnerOpen) => set({ winnerOpen }),
}));
