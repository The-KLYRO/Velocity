import { create } from "zustand";
import type { QueueItem } from "../types";

interface QueueState {
  items: QueueItem[];
  addItem: (item: QueueItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<QueueItem>) => void;
  clearQueue: () => void;
}

const mockQueue: QueueItem[] = [
  { id: "q-1", campaignId: "camp-1", recipientId: "r-1", status: "processing", attempts: 0, createdAt: new Date("2024-10-24T10:00:00") },
  { id: "q-2", campaignId: "camp-1", recipientId: "r-2", status: "sent", attempts: 1, createdAt: new Date("2024-10-24T10:01:00") },
  { id: "q-3", campaignId: "camp-4", recipientId: "r-6", status: "pending", attempts: 0, nextRetry: new Date("2024-10-24T11:00:00"), createdAt: new Date("2024-10-24T10:30:00") },
];

export const useQueueStore = create<QueueState>((set) => ({
  items: mockQueue,
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
