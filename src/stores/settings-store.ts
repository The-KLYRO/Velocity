import { create } from "zustand";
import * as api from "../lib/tauri-api";

interface SettingsState {
  delayMs: number;
  retryCount: number;
  dailyLimit: number;
  batchSize: number;
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
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  setDelayMs: (ms: number) => void;
  setRetryCount: (count: number) => void;
  setDailyLimit: (limit: number) => void;
  setBatchSize: (size: number) => void;
  toggleNotification: (key: keyof SettingsState["notifications"]) => void;
  toggleTracking: (key: keyof SettingsState["tracking"]) => void;
  setSignature: (signature: string) => void;
  saveAll: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  delayMs: 1000,
  retryCount: 3,
  dailyLimit: 500,
  batchSize: 50,
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
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await api.fetchAllSettings();
      set({
        delayMs: settings.delay_ms ? Number(settings.delay_ms) : 1000,
        retryCount: settings.retry_count ? Number(settings.retry_count) : 3,
        dailyLimit: settings.daily_limit ? Number(settings.daily_limit) : 500,
        batchSize: settings.batch_size ? Number(settings.batch_size) : 50,
        notifications: {
          campaignCompleted: settings.notif_campaign_completed !== "false",
          bounceAlerts: settings.notif_bounce_alerts !== "false",
          dailySummary: settings.notif_daily_summary === "true",
        },
        tracking: {
          openTracking: settings.tracking_open !== "false",
          clickTracking: settings.tracking_click !== "false",
        },
        signature: settings.signature ?? "",
        isLoading: false,
      });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  setDelayMs: (ms) => set({ delayMs: ms }),
  setRetryCount: (count) => set({ retryCount: count }),
  setDailyLimit: (limit) => set({ dailyLimit: limit }),
  setBatchSize: (size) => set({ batchSize: size }),

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

  saveAll: async () => {
    const s = get();
    const batch: [string, string][] = [
      ["delay_ms", String(s.delayMs)],
      ["retry_count", String(s.retryCount)],
      ["daily_limit", String(s.dailyLimit)],
      ["batch_size", String(s.batchSize)],
      ["notif_campaign_completed", String(s.notifications.campaignCompleted)],
      ["notif_bounce_alerts", String(s.notifications.bounceAlerts)],
      ["notif_daily_summary", String(s.notifications.dailySummary)],
      ["tracking_open", String(s.tracking.openTracking)],
      ["tracking_click", String(s.tracking.clickTracking)],
      ["signature", s.signature],
    ];
    try {
      await api.saveSettingsBatch(batch);
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));
