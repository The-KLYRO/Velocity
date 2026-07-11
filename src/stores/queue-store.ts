import { create } from "zustand";
import type { QueueItem } from "../types";

interface QueueState {
  items: QueueItem[];
  addItem: (item: QueueItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<QueueItem>) => void;
  clearQueue: () => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  clearQueue: () => set({ items: [] }),
}));
