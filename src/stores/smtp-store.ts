import { create } from "zustand";
import type { SmtpAccount } from "../types";
import * as api from "../lib/tauri-api";

interface SmtpState {
  accounts: SmtpAccount[];
  activeAccount: SmtpAccount | null;
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  addAccount: (account: SmtpAccount) => Promise<SmtpAccount | null>;
  removeAccount: (id: string) => Promise<void>;
  setActiveAccount: (account: SmtpAccount | null) => void;
  updateAccount: (id: string, updates: Partial<SmtpAccount>) => Promise<void>;
  testConnection: (
    email: string,
    password: string,
    host: string,
    port: number
  ) => Promise<{ connected: boolean; message: string }>;
}

export const useSmtpStore = create<SmtpState>((set, get) => ({
  accounts: [],
  activeAccount: null,
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await api.fetchSmtpAccounts();
      const activeAccount = accounts.find((a) => a.isConnected) ?? accounts[0] ?? null;
      set({ accounts, activeAccount, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addAccount: async (account) => {
    try {
      const saved = await api.saveSmtpAccount(account);
      set((state) => ({
        accounts: [...state.accounts, saved],
        activeAccount: state.activeAccount ?? saved,
      }));
      return saved;
    } catch (e) {
      set({ error: String(e) });
      return null;
    }
  },

  removeAccount: async (id) => {
    try {
      await api.deleteSmtpAccount(id);
      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
        activeAccount:
          state.activeAccount?.id === id ? null : state.activeAccount,
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  setActiveAccount: (account) => set({ activeAccount: account }),

  updateAccount: async (id, updates) => {
    try {
      const existing = get().accounts.find((a) => a.id === id);
      if (!existing) return;

      const updatedAccount = { ...existing, ...updates };
      const saved = await api.saveSmtpAccount(updatedAccount);

      set((state) => ({
        accounts: state.accounts.map((a) =>
          a.id === id ? saved : a
        ),
        activeAccount:
          state.activeAccount?.id === id ? saved : state.activeAccount,
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  testConnection: async (email, password, host, port) => {
    try {
      const result = await api.testSmtpConnection(email, password, host, port);
      return result;
    } catch (e) {
      return { connected: false, message: String(e) };
    }
  },
}));
