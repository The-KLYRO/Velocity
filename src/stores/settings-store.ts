import { create } from "zustand";

interface SettingsState {
  delayMs: number;
  retryCount: number;
  dailyLimit: number;
  notifications: {
    campaignCompleted: boolean;
    bounceAlerts: boolean;
    dailySummary: boolean;
  };
  tracking: {
    openTracking: boolean;
    clickTracking: boolean;
  };
  signature: string;
  setDelayMs: (ms: number) => void;
  setRetryCount: (count: number) => void;
  setDailyLimit: (limit: number) => void;
  toggleNotification: (key: keyof SettingsState["notifications"]) => void;
  toggleTracking: (key: keyof SettingsState["tracking"]) => void;
  setSignature: (signature: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  delayMs: 1000,
  retryCount: 3,
  dailyLimit: 500,
  notifications: {
    campaignCompleted: true,
    bounceAlerts: true,
    dailySummary: false,
  },
  tracking: {
    openTracking: true,
    clickTracking: true,
  },
  signature: "",
  setDelayMs: (ms) => set({ delayMs: ms }),
  setRetryCount: (count) => set({ retryCount: count }),
  setDailyLimit: (limit) => set({ dailyLimit: limit }),
  toggleNotification: (key) =>
    set((state) => ({
      notifications: {
        ...state.notifications,
        [key]: !state.notifications[key],
      },
    })),
  toggleTracking: (key) =>
    set((state) => ({
      tracking: {
        ...state.tracking,
        [key]: !state.tracking[key],
      },
    })),
  setSignature: (signature) => set({ signature }),
}));
