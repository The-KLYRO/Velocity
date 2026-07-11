import { create } from "zustand";
import type { Recipient, RecipientStatus } from "../types";

interface RecipientState {
  recipients: Recipient[];
  selectedIds: Set<string>;
  filter: RecipientStatus | "all";
  searchQuery: string;
  addRecipient: (recipient: Recipient) => void;
  addRecipients: (recipients: Recipient[]) => void;
  removeRecipient: (id: string) => void;
  removeRecipients: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilter: (filter: RecipientStatus | "all") => void;
  setSearchQuery: (query: string) => void;
}

const mockRecipients: Recipient[] = [
  { id: "r-1", email: "julianne.s@acme-corp.io", name: "Julianne Smith", company: "Acme Corp", status: "active", tags: ["enterprise", "q4"], createdAt: new Date("2024-09-15"), lastSent: new Date("2024-10-24") },
  { id: "r-2", email: "m.reed@stellar-dynamics.com", name: "Marcus Reed", company: "Stellar Dynamics", status: "active", tags: ["startup", "tech"], createdAt: new Date("2024-08-20"), lastSent: new Date("2024-10-23") },
  { id: "r-3", email: "ben@outdated-domain.net", name: "Ben Kessler", company: "Nebula Soft", status: "bounced", tags: ["old"], createdAt: new Date("2024-07-10"), lastSent: undefined },
  { id: "r-4", email: "elena.l@prism-design.co", name: "Elena Lopez", company: "Prism Design", status: "active", tags: ["design", "creative"], createdAt: new Date("2024-09-01"), lastSent: new Date("2024-10-22") },
  { id: "r-5", email: "fischer.d@logistics-v2.com", name: "David Fischer", company: "Logistics V2", status: "active", tags: ["logistics", "enterprise"], createdAt: new Date("2024-06-15"), lastSent: new Date("2024-10-20") },
  { id: "r-6", email: "sarah.chen@techflow.io", name: "Sarah Chen", company: "TechFlow", status: "active", tags: ["saas", "growth"], createdAt: new Date("2024-10-01"), lastSent: new Date("2024-10-24") },
  { id: "r-7", email: "invalid@nowhere.xyz", name: "Ghost User", company: "Nowhere Inc", status: "invalid", tags: ["test"], createdAt: new Date("2024-10-10"), lastSent: undefined },
  { id: "r-8", email: "alex.m@cloudnine.dev", name: "Alex Morgan", company: "CloudNine", status: "active", tags: ["cloud", "devops"], createdAt: new Date("2024-08-05"), lastSent: new Date("2024-10-19") },
  { id: "r-9", email: "opt-out@newsletter.com", name: "Pat Johnson", company: "Newsletter Co", status: "unsubscribed", tags: ["unsub"], createdAt: new Date("2024-05-20"), lastSent: new Date("2024-06-10") },
  { id: "r-10", email: "priya.r@datawave.in", name: "Priya Rao", company: "DataWave", status: "active", tags: ["analytics", "enterprise"], createdAt: new Date("2024-09-12"), lastSent: new Date("2024-10-21") },
];

export const useRecipientStore = create<RecipientState>((set) => ({
  recipients: mockRecipients,
  selectedIds: new Set(),
  filter: "all",
  searchQuery: "",
  addRecipient: (recipient) =>
    set((state) => ({ recipients: [...state.recipients, recipient] })),
  addRecipients: (recipients) =>
    set((state) => ({ recipients: [...state.recipients, ...recipients] })),
  removeRecipient: (id) =>
    set((state) => ({
      recipients: state.recipients.filter((r) => r.id !== id),
      selectedIds: (() => { const s = new Set(state.selectedIds); s.delete(id); return s; })(),
    })),
  removeRecipients: (ids) =>
    set((state) => ({
      recipients: state.recipients.filter((r) => !ids.includes(r.id)),
      selectedIds: new Set(),
    })),
  toggleSelection: (id) =>
    set((state) => {
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedIds: newSelected };
    }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
