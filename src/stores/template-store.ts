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

const mockTemplates: Template[] = [
  {
    id: "tpl-1",
    name: "Welcome Series",
    subject: "Welcome to {{company}}, {{first_name}}!",
    bodyHtml: "<p>Hi {{first_name}},</p><p>We're thrilled to have you on board. At {{company}}, we're committed to helping you succeed.</p><p>Best regards,<br>The {{company}} Team</p>",
    bodyText: "Hi {{first_name}},\n\nWe're thrilled to have you on board.\n\nBest regards,\nThe {{company}} Team",
    variables: ["first_name", "company", "email", "industry", "role"],
    createdAt: new Date("2024-10-20"),
  },
  {
    id: "tpl-2",
    name: "Newsletter Monthly",
    subject: "Your monthly update from {{company}}",
    bodyHtml: "<p>Hi {{first_name}},</p><p>Here's what happened this month at {{company}}:</p><ul><li>New feature launches</li><li>Industry insights</li><li>Upcoming events</li></ul>",
    variables: ["first_name", "company"],
    createdAt: new Date("2024-10-15"),
  },
  {
    id: "tpl-3",
    name: "Re-engagement",
    subject: "We miss you, {{first_name}}!",
    bodyHtml: "<p>Hi {{first_name}},</p><p>It's been a while since your last visit. We've made some exciting updates at {{company}} that we think you'll love.</p><p>Come back and see what's new!</p>",
    variables: ["first_name", "company"],
    createdAt: new Date("2024-10-10"),
  },
  {
    id: "tpl-4",
    name: "Product Launch",
    subject: "Introducing our latest product",
    bodyHtml: "<p>Hi {{first_name}},</p><p>We're excited to announce our newest product at {{company}}. Built for teams like yours in the {{industry}} space, it's designed to streamline your workflow.</p><p>Request early access today.</p>",
    variables: ["first_name", "company", "industry", "role", "last_order_id", "email"],
    createdAt: new Date("2024-10-01"),
  },
];

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: mockTemplates,
  activeTemplate: null,
  addTemplate: (template) =>
    set((state) => ({ templates: [...state.templates, template] })),
  removeTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
      activeTemplate: state.activeTemplate?.id === id ? null : state.activeTemplate,
    })),
  setActiveTemplate: (template) => set({ activeTemplate: template }),
  updateTemplate: (id, updates) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
      activeTemplate:
        state.activeTemplate?.id === id
          ? { ...state.activeTemplate, ...updates }
          : state.activeTemplate,
    })),
}));
