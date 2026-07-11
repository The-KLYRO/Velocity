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

const mockCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "Q4 Expansion Push",
    status: "running",
    templateId: "tpl-1",
    createdAt: new Date("2024-10-20"),
    sentCount: 9337,
    totalCount: 12450,
  },
  {
    id: "camp-2",
    name: "Internal Newsletter",
    status: "paused",
    templateId: "tpl-2",
    createdAt: new Date("2024-10-22"),
    sentCount: 272,
    totalCount: 850,
  },
  {
    id: "camp-3",
    name: "Black Friday Flash",
    status: "completed",
    templateId: "tpl-3",
    createdAt: new Date("2024-10-18"),
    sentCount: 45000,
    totalCount: 45000,
  },
  {
    id: "camp-4",
    name: "Beta Invite Wave 2",
    status: "running",
    templateId: "tpl-4",
    createdAt: new Date("2024-10-24"),
    sentCount: 4628,
    totalCount: 5200,
  },
];

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: mockCampaigns,
  activeCampaign: null,
  addCampaign: (campaign) =>
    set((state) => ({ campaigns: [...state.campaigns, campaign] })),
  removeCampaign: (id) =>
    set((state) => ({
      campaigns: state.campaigns.filter((c) => c.id !== id),
      activeCampaign: state.activeCampaign?.id === id ? null : state.activeCampaign,
    })),
  setActiveCampaign: (campaign) => set({ activeCampaign: campaign }),
  updateCampaign: (id, updates) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
      activeCampaign:
        state.activeCampaign?.id === id
          ? { ...state.activeCampaign, ...updates }
          : state.activeCampaign,
    })),
}));
