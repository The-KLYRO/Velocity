import { create } from "zustand";

interface SendingState {
  isSending: boolean;
  currentCampaignId: string | null;
  progress: number;
  sentCount: number;
  totalCount: number;
  startSending: (campaignId: string, total: number) => void;
  updateProgress: (sent: number) => void;
  stopSending: () => void;
}

export const useSendingStore = create<SendingState>((set) => ({
  isSending: false,
  currentCampaignId: null,
  progress: 0,
  sentCount: 0,
  totalCount: 0,
  startSending: (campaignId, total) =>
    set({
      isSending: true,
      currentCampaignId: campaignId,
      progress: 0,
      sentCount: 0,
      totalCount: total,
    }),
  updateProgress: (sent) =>
    set((state) => ({
      sentCount: sent,
      progress: Math.round((sent / state.totalCount) * 100),
    })),
  stopSending: () =>
    set({
      isSending: false,
      currentCampaignId: null,
      progress: 0,
      sentCount: 0,
      totalCount: 0,
    }),
}));
