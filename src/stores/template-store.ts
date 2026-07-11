import { create } from "zustand";
import type { Template } from "../types";

interface TemplateState {
  templates: Template[];
  activeTemplate: Template | null;
  addTemplate: (template: Template) => void;
  removeTemplate: (id: string) => void;
  setActiveTemplate: (template: Template | null) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  activeTemplate: null,
  addTemplate: (template) =>
    set((state) => ({ templates: [...state.templates, template] })),
  removeTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),
  setActiveTemplate: (template) => set({ activeTemplate: template }),
  updateTemplate: (id, updates) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
}));
