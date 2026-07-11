import { create } from "zustand";
import type { Recipient, RecipientStatus } from "../types";

interface RecipientState {
  recipients: Recipient[];
  selectedIds: Set<string>;
  filter: RecipientStatus | "all";
  searchQuery: string;
  addRecipient: (recipient: Recipient) => void;
  removeRecipient: (id: string) => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilter: (filter: RecipientStatus | "all") => void;
  setSearchQuery: (query: string) => void;
}

export const useRecipientStore = create<RecipientState>((set) => ({
  recipients: [],
  selectedIds: new Set(),
  filter: "all",
  searchQuery: "",
  addRecipient: (recipient) =>
    set((state) => ({ recipients: [...state.recipients, recipient] })),
  removeRecipient: (id) =>
    set((state) => ({
      recipients: state.recipients.filter((r) => r.id !== id),
    })),
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
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
