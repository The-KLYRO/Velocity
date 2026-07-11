import { create } from "zustand";
import type { Recipient, RecipientStatus } from "../types";
import * as api from "../lib/tauri-api";

interface RecipientState {
  recipients: Recipient[];
  total: number;
  selectedIds: Set<string>;
  filter: RecipientStatus | "all";
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  page: number;
  perPage: number;
  fetchRecipients: () => Promise<void>;
  fetchSearchResults: (query: string) => Promise<void>;
  addRecipient: (email: string, name: string, company?: string) => Promise<Recipient | null>;
  addRecipients: (recipients: Recipient[]) => void;
  removeRecipient: (id: string) => Promise<void>;
  removeRecipients: (ids: string[]) => Promise<void>;
  importCsv: (filePath: string) => Promise<Recipient[]>;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilter: (filter: RecipientStatus | "all") => void;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
}

export const useRecipientStore = create<RecipientState>((set, get) => ({
  recipients: [],
  total: 0,
  selectedIds: new Set(),
  filter: "all",
  searchQuery: "",
  isLoading: false,
  error: null,
  page: 1,
  perPage: 50,

  fetchRecipients: async () => {
    const { filter, page, perPage } = get();
    set({ isLoading: true, error: null });
    try {
      const filterParam = filter === "all" ? undefined : filter;
      const result = await api.fetchRecipients(filterParam, page, perPage);
      set({ recipients: result.recipients, total: result.total, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  fetchSearchResults: async (query) => {
    if (!query.trim()) {
      get().fetchRecipients();
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const result = await api.searchRecipients(query, 1, get().perPage);
      set({ recipients: result.recipients, total: result.total, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addRecipient: async (email, name, company) => {
    try {
      const recipient = await api.addRecipient(email, name, company);
      set((state) => ({
        recipients: [recipient, ...state.recipients],
        total: state.total + 1,
      }));
      return recipient;
    } catch (e) {
      set({ error: String(e) });
      return null;
    }
  },

  addRecipients: (recipients) =>
    set((state) => ({
      recipients: [...recipients, ...state.recipients],
      total: state.total + recipients.length,
    })),

  removeRecipient: async (id) => {
    try {
      await api.deleteRecipients([id]);
      set((state) => ({
        recipients: state.recipients.filter((r) => r.id !== id),
        total: state.total - 1,
        selectedIds: (() => {
          const s = new Set(state.selectedIds);
          s.delete(id);
          return s;
        })(),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  removeRecipients: async (ids) => {
    try {
      await api.deleteRecipients(ids);
      set((state) => ({
        recipients: state.recipients.filter((r) => !ids.includes(r.id)),
        total: state.total - ids.length,
        selectedIds: new Set(),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  importCsv: async (filePath) => {
    try {
      const imported = await api.importRecipientsCsv(filePath);
      set((state) => ({
        recipients: [...imported, ...state.recipients],
        total: state.total + imported.length,
      }));
      return imported;
    } catch (e) {
      set({ error: String(e) });
      return [];
    }
  },

  toggleSelection: (id) =>
    set((state) => {
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedIds: newSelected };
    }),

  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),

  setFilter: (filter) => {
    set({ filter, page: 1 });
    setTimeout(() => get().fetchRecipients(), 0);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setPage: (page) => {
    set({ page });
    setTimeout(() => get().fetchRecipients(), 0);
  },
}));
