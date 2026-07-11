import { create } from "zustand";
import type { Campaign } from "../types";
import * as api from "../lib/tauri-api";

interface CampaignState {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  addCampaign: (campaign: Campaign) => Promise<void>;
  removeCampaign: (id: string) => Promise<void>;
  setActiveCampaign: (campaign: Campaign | null) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  pauseCampaign: (id: string) => Promise<void>;
  resumeCampaign: (id: string) => Promise<void>;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
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

  addCampaign: async (campaign) => {
    try {
      const created = await api.createCampaign(
        campaign.name,
        campaign.templateId,
        campaign.totalCount
      );
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
        activeCampaign:
          state.activeCampaign?.id === id ? null : state.activeCampaign,
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  setActiveCampaign: (campaign) => set({ activeCampaign: campaign }),

  updateCampaign: async (id, updates) => {
    try {
      if (updates.status === "running") {
        await api.startCampaign(id);
      } else if (updates.status === "paused") {
        await api.pauseCampaign(id);
      }
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

  pauseCampaign: async (id) => {
    try {
      await api.pauseCampaign(id);
      set((state) => ({
        campaigns: state.campaigns.map((c) =>
          c.id === id ? { ...c, status: "paused" as const } : c
        ),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  resumeCampaign: async (id) => {
    try {
      await api.resumeCampaign(id);
      set((state) => ({
        campaigns: state.campaigns.map((c) =>
          c.id === id ? { ...c, status: "running" as const } : c
        ),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));
