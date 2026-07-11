import { create } from "zustand";
import type { Campaign, Broadcast } from "../types";
import * as api from "../lib/tauri-api";

interface CampaignState {
  campaigns: Campaign[];
  broadcasts: Broadcast[];
  activeCampaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  fetchBroadcasts: (campaignId: string) => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, "id" | "createdAt" | "broadcastCount" | "totalSent">) => Promise<void>;
  removeCampaign: (id: string) => Promise<void>;
  setActiveCampaign: (campaign: Campaign | null) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  addBroadcast: (broadcast: Omit<Broadcast, "id" | "createdAt">) => Promise<void>;
  pauseBroadcast: (id: string) => Promise<void>;
  resumeBroadcast: (id: string) => Promise<void>;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  broadcasts: [],
  activeCampaign: null,
  isLoading: false,
  error: null,

  fetchCampaigns: async () => {
    set({ isLoading: true, error: null });
    try {
      const campaigns = await api.fetchCampaigns();
      set({ campaigns, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  fetchBroadcasts: async (campaignId: string) => {
    try {
      const broadcasts = await api.fetchBroadcasts(campaignId);
      set({ broadcasts });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  addCampaign: async (campaign) => {
    try {
      const created = await api.createCampaign(campaign.name, campaign.description, campaign.recipientListId);
      set((state) => ({ campaigns: [created, ...state.campaigns] }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  removeCampaign: async (id) => {
    try {
      await api.deleteCampaign(id);
      set((state) => ({
        campaigns: state.campaigns.filter((c) => c.id !== id),
        activeCampaign: state.activeCampaign?.id === id ? null : state.activeCampaign,
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  setActiveCampaign: (campaign) => set({ activeCampaign: campaign }),

  updateCampaign: async (id, updates) => {
    try {
      await api.updateCampaign(id, updates);
      set((state) => ({
        campaigns: state.campaigns.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
        activeCampaign:
          state.activeCampaign?.id === id
            ? { ...state.activeCampaign, ...updates }
            : state.activeCampaign,
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  addBroadcast: async (broadcast) => {
    try {
      const created = await api.createBroadcast(broadcast);
      set((state) => ({
        broadcasts: [created, ...state.broadcasts],
        campaigns: state.campaigns.map((c) =>
          c.id === broadcast.campaignId
            ? { ...c, broadcastCount: c.broadcastCount + 1, lastBroadcastAt: new Date() }
            : c
        ),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  pauseBroadcast: async (id) => {
    try {
      await api.pauseBroadcast(id);
      set((state) => ({
        broadcasts: state.broadcasts.map((b) =>
          b.id === id ? { ...b, status: "paused" as const } : b
        ),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  resumeBroadcast: async (id) => {
    try {
      await api.resumeBroadcast(id);
      set((state) => ({
        broadcasts: state.broadcasts.map((b) =>
          b.id === id ? { ...b, status: "running" as const } : b
        ),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));
