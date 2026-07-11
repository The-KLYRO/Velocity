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

const mockAccounts: SmtpAccount[] = [
  {
    id: "smtp-1",
    email: "marketing@lumina-velocity.com",
    host: "smtp.gmail.com",
    port: 587,
    encryption: "starttls",
    dailyLimit: 500,
    delayMs: 1000,
    retryCount: 3,
    isConnected: true,
  },
  {
    id: "smtp-2",
    email: "noreply@lumina-velocity.com",
    host: "smtp.custom-server.com",
    port: 465,
    encryption: "tls",
    dailyLimit: 1000,
    delayMs: 1500,
    retryCount: 5,
    isConnected: false,
  },
];

export const useSmtpStore = create<SmtpState>((set) => ({
  accounts: mockAccounts,
  activeAccount: mockAccounts[0],
  addAccount: (account) =>
    set((state) => ({ accounts: [...state.accounts, account] })),
  removeAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
      activeAccount: state.activeAccount?.id === id ? null : state.activeAccount,
    })),
  setActiveAccount: (account) => set({ activeAccount: account }),
  updateAccount: (id, updates) =>
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
      activeAccount:
        state.activeAccount?.id === id
          ? { ...state.activeAccount, ...updates }
          : state.activeAccount,
    })),
}));
