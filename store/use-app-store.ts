"use client";
import { create } from "zustand";

type AppState = {
  address: string | null;
  votedId: number | null;
  voteIncrements: Record<number, number>;
  walletOpen: boolean;
  winnerOpen: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  restoreWallet: () => Promise<void>;
  vote: (id: number) => void;
  setWalletOpen: (value: boolean) => void;
  setWinnerOpen: (value: boolean) => void;
};

async function ensureRobinhoodNetwork() {
  if (!window.ethereum)
    throw new Error("Install MetaMask or another EVM browser wallet first.");
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x1237" }],
    });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 4902) throw error;
    await window.ethereum.request({
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

export const useAppStore = create<AppState>((set) => ({
  address: null,
  votedId: null,
  voteIncrements: {},
  walletOpen: false,
  winnerOpen: false,
  connect: async () => {
    if (!window.ethereum) throw new Error("No browser wallet detected.");
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];
    await ensureRobinhoodNetwork();
    set({ address: accounts[0] ?? null, walletOpen: false });
  },
  restoreWallet: async () => {
    if (!window.ethereum) return;
    const accounts = (await window.ethereum.request({
      method: "eth_accounts",
    })) as string[];
    if (accounts[0]) set({ address: accounts[0] });
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
  disconnect: () => set({ address: null, walletOpen: false }),
  setWalletOpen: (walletOpen) => set({ walletOpen }),
  setWinnerOpen: (winnerOpen) => set({ winnerOpen }),
}));
