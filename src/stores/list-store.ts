import { create } from "zustand";
import * as api from "../lib/tauri-api";

interface ListState {
  lists: api.RecipientList[];
  selectedListId: string | null;
  listMembers: api.ListMember[];
  isLoading: boolean;
  error: string | null;
  fetchLists: () => Promise<void>;
  createList: (name: string, description?: string) => Promise<api.RecipientList | null>;
  deleteList: (id: string) => Promise<void>;
  renameList: (id: string, name: string) => Promise<void>;
  selectList: (id: string | null) => void;
  fetchListMembers: (listId: string) => Promise<void>;
  addMembersToList: (listId: string, recipientIds: string[]) => Promise<void>;
  removeMembersFromList: (listId: string, recipientIds: string[]) => Promise<void>;
}

export const useListStore = create<ListState>((set, get) => ({
  lists: [],
  selectedListId: null,
  listMembers: [],
  isLoading: false,
  error: null,

  fetchLists: async () => {
    set({ isLoading: true, error: null });
    try {
      const lists = await api.fetchRecipientLists();
      set({ lists, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  createList: async (name, description) => {
    try {
      const list = await api.createRecipientList(name, description);
      set((state) => ({ lists: [...state.lists, list] }));
      return list;
    } catch (e) {
      set({ error: String(e) });
      return null;
    }
  },

  deleteList: async (id) => {
    try {
      await api.deleteRecipientList(id);
      set((state) => ({
        lists: state.lists.filter((l) => l.id !== id),
        selectedListId: state.selectedListId === id ? null : state.selectedListId,
        listMembers: state.selectedListId === id ? [] : state.listMembers,
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  renameList: async (id, name) => {
    try {
      await api.renameRecipientList(id, name);
      set((state) => ({
        lists: state.lists.map((l) =>
          l.id === id ? { ...l, name } : l
        ),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  selectList: (id) => {
    set({ selectedListId: id, listMembers: [] });
    if (id) {
      get().fetchListMembers(id);
    }
  },

  fetchListMembers: async (listId) => {
    set({ isLoading: true, error: null });
    try {
      const members = await api.getListRecipients(listId);
      set({ listMembers: members, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addMembersToList: async (listId, recipientIds) => {
    try {
      await api.addRecipientsToList(listId, recipientIds);
      await get().fetchListMembers(listId);
      const lists = await api.fetchRecipientLists();
      set({ lists });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  removeMembersFromList: async (listId, recipientIds) => {
    try {
      await api.removeRecipientsFromList(listId, recipientIds);
      await get().fetchListMembers(listId);
      const lists = await api.fetchRecipientLists();
      set({ lists });
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));
