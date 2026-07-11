import { create } from "zustand";
import type { Campaign } from "../types";

interface CampaignState {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  addCampaign: (campaign: Campaign) => void;
  removeCampaign: (id: string) => void;
  setActiveCampaign: (campaign: Campaign | null) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  activeCampaign: null,
  addCampaign: (campaign) =>
    set((state) => ({ campaigns: [...state.campaigns, campaign] })),
  removeCampaign: (id) =>
    set((state) => ({
      campaigns: state.campaigns.filter((c) => c.id !== id),
    })),
  setActiveCampaign: (campaign) => set({ activeCampaign: campaign }),
  updateCampaign: (id, updates) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
}));
