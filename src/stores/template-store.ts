import { create } from "zustand";
import type { Template } from "../types";
import * as api from "../lib/tauri-api";

interface TemplateState {
  templates: Template[];
  activeTemplate: Template | null;
  isLoading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  addTemplate: (template: Omit<Template, "id" | "createdAt">) => Promise<Template | null>;
  removeTemplate: (id: string) => Promise<void>;
  setActiveTemplate: (template: Template | null) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  activeTemplate: null,
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await api.fetchTemplates();
      set({ templates, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addTemplate: async (template) => {
    try {
      const created = await api.createTemplate(
        template.name,
        template.subject,
        template.bodyHtml,
        template.bodyText,
        template.variables
      );
      set((state) => ({ templates: [created, ...state.templates] }));
      return created;
    } catch (e) {
      set({ error: String(e) });
      return null;
    }
  },

  removeTemplate: async (id) => {
    try {
      await api.deleteTemplate(id);
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
        activeTemplate:
          state.activeTemplate?.id === id ? null : state.activeTemplate,
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  setActiveTemplate: (template) => set({ activeTemplate: template }),

  updateTemplate: async (id, updates) => {
    try {
      const updated = await api.updateTemplate(id, {
        name: updates.name,
        subject: updates.subject,
        bodyHtml: updates.bodyHtml,
        bodyText: updates.bodyText,
        variables: updates.variables,
      });
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? updated : t)),
        activeTemplate:
          state.activeTemplate?.id === id ? updated : state.activeTemplate,
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));
