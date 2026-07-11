import { create } from "zustand";
import type { SmtpAccount } from "../types";

interface SmtpState {
  accounts: SmtpAccount[];
  activeAccount: SmtpAccount | null;
  addAccount: (account: SmtpAccount) => void;
  removeAccount: (id: string) => void;
  setActiveAccount: (account: SmtpAccount | null) => void;
  updateAccount: (id: string, updates: Partial<SmtpAccount>) => void;
}

export const useSmtpStore = create<SmtpState>((set) => ({
  accounts: [],
  activeAccount: null,
  addAccount: (account) =>
    set((state) => ({ accounts: [...state.accounts, account] })),
  removeAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
    })),
  setActiveAccount: (account) => set({ activeAccount: account }),
  updateAccount: (id, updates) =>
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),
}));
