import { create } from "zustand";

interface SendingState {
  isSending: boolean;
  currentCampaignId: string | null;
  progress: number;
  sentCount: number;
  failedCount: number;
  totalCount: number;
  startTime: number | null;
  currentEmail: string;
  startSending: (campaignId: string, total: number) => void;
  incrementProgress: (sent: number, failed: number, current: string) => void;
  stopSending: () => void;
}

export const useSendingStore = create<SendingState>((set) => ({
  isSending: false,
  currentCampaignId: null,
  progress: 0,
  sentCount: 0,
  failedCount: 0,
  totalCount: 0,
  startTime: null,
  currentEmail: "",
  startSending: (campaignId, total) =>
    set({
      isSending: true,
      currentCampaignId: campaignId,
      progress: 0,
      sentCount: 0,
      failedCount: 0,
      totalCount: total,
      startTime: Date.now(),
      currentEmail: "",
    }),
  incrementProgress: (sent, failed, current) =>
    set((state) => ({
      sentCount: sent,
      failedCount: failed,
      currentEmail: current,
      progress: state.totalCount > 0 ? Math.round(((sent + failed) / state.totalCount) * 100) : 0,
    })),
  stopSending: () =>
    set({
      isSending: false,
      currentCampaignId: null,
      progress: 0,
      sentCount: 0,
      failedCount: 0,
      totalCount: 0,
      startTime: null,
      currentEmail: "",
    }),
}));
