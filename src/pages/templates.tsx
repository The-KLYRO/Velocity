import { useState } from "react";
import { TopBar } from "../layout/topbar";
import { GlassCard, Button, Modal, Input } from "../components/ui";
import { useTemplateStore } from "../stores/template-store";
import type { Template } from "../types";

export function TemplatesPage() {
  const { templates, addTemplate, updateTemplate, removeTemplate } = useTemplateStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");

  const openCreate = () => {
    setEditingTemplate(null);
    setFormName("");
    setFormSubject("");
    setFormBody("");
    setIsModalOpen(true);
  };

  const openEdit = (tpl: Template) => {
    setEditingTemplate(tpl);
    setFormName(tpl.name);
    setFormSubject(tpl.subject);
    setFormBody(tpl.bodyHtml);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        name: formName,
        subject: formSubject,
        bodyHtml: formBody,
      });
    } else {
      addTemplate({
        id: `tpl-${Date.now()}`,
        name: formName,
        subject: formSubject,
        bodyHtml: formBody,
        variables: [],
        createdAt: new Date(),
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    removeTemplate(id);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Templates" searchPlaceholder="Search templates..." />

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">Email Templates</h3>
              <p className="text-label-md text-on-surface-variant">Manage your email templates for campaigns</p>
            </div>
            <Button icon="add" onClick={openCreate}>Create Template</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <GlassCard key={template.id} hover className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div>
                      <h4 className="font-headline-md text-on-surface">{template.name}</h4>
                      <p className="text-label-sm text-on-surface-variant">
                        {Math.floor((Date.now() - template.createdAt.getTime()) / 86400000)} days ago
                      </p>
                    </div>
                  </div>
                  <button className="p-1.5 text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-high/40 border border-glass-stroke">
                  <p className="text-label-sm text-on-surface-variant">Subject</p>
                  <p className="text-label-md text-on-surface mt-1">{template.subject}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-glass-stroke">
                  <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">data_object</span>
                    {template.variables.length} variables
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(template)}
                      className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(template.bodyHtml);
                      }}
                      className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 hover:bg-error/10 hover:text-error rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}

            <button
              onClick={openCreate}
              className="group rounded-2xl border-2 border-dashed border-glass-stroke hover:border-primary/50 flex flex-col items-center justify-center gap-4 transition-all hover:bg-primary/5 p-6 min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl text-on-surface-variant group-hover:text-primary">add</span>
              </div>
              <p className="font-headline-md text-on-surface">New Template</p>
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? "Edit Template" : "Create Template"}
      >
        <div className="space-y-4">
          <Input
            label="Template Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Welcome Series"
          />
          <Input
            label="Subject Line"
            value={formSubject}
            onChange={(e) => setFormSubject(e.target.value)}
            placeholder="e.g. Welcome to {{company}}!"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Body (HTML)</label>
            <textarea
              className="w-full bg-surface-container-high/50 border border-glass-stroke rounded-xl px-4 py-2.5 text-label-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all h-40 resize-none"
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="<p>Hello {{first_name}},</p>"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingTemplate ? "Save Changes" : "Create Template"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
