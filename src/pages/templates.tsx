import { useState, useEffect } from "react";
import { Modal, Input } from "../components/ui";
import { useTemplateStore } from "../stores/template-store";

export function TemplatesPage() {
  const { templates, fetchTemplates, addTemplate, updateTemplate, removeTemplate } = useTemplateStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{ id: string; name: string; subject: string; bodyHtml: string } | null>(null);
  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const openCreate = () => {
    setEditingTemplate(null);
    setFormName("");
    setFormSubject("");
    setFormBody("");
    setIsModalOpen(true);
  };

  const openEdit = (tpl: { id: string; name: string; subject: string; bodyHtml: string }) => {
    setEditingTemplate(tpl);
    setFormName(tpl.name);
    setFormSubject(tpl.subject);
    setFormBody(tpl.bodyHtml);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, {
        name: formName,
        subject: formSubject,
        bodyHtml: formBody,
      });
    } else {
      await addTemplate({
        name: formName,
        subject: formSubject,
        bodyHtml: formBody,
        variables: [],
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await removeTemplate(id);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div className="h2">Email Templates</div>
          <div style={{ fontSize: 12, color: "var(--text2)" }}>Manage your email templates for campaigns</div>
        </div>
        <button className="pillBtn" onClick={openCreate} type="button">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          Create Template
        </button>
      </div>

      <div className="kpiRow" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {templates.length === 0 && (
          <div className="card card--pad" style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 14, color: "var(--text2)" }}>No templates yet. Create one to get started.</div>
          </div>
        )}

        {templates.map((template) => (
          <div key={template.id} className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--text1)" }}>description</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{template.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text2)" }}>
                    {Math.floor((Date.now() - template.createdAt.getTime()) / 86400000)} days ago
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: 10, borderRadius: 12, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)" }}>
              <div style={{ fontSize: 10, color: "var(--text2)" }}>Subject</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{template.subject}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--stroke0)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text2)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>data_object</span>
                {template.variables.length} variables
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => openEdit(template)} style={{ background: "none", border: "none", color: "var(--text1)", cursor: "pointer", padding: 6, borderRadius: 8 }} type="button">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                </button>
                <button onClick={() => navigator.clipboard.writeText(template.bodyHtml)} style={{ background: "none", border: "none", color: "var(--text1)", cursor: "pointer", padding: 6, borderRadius: 8 }} type="button">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>content_copy</span>
                </button>
                <button onClick={() => handleDelete(template.id)} style={{ background: "none", border: "none", color: "var(--bad)", cursor: "pointer", padding: 6, borderRadius: 8 }} type="button">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={openCreate}
          className="card"
          style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, minHeight: 200, borderStyle: "dashed", cursor: "pointer", background: "transparent" }}
          type="button"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--text2)" }}>add</span>
          <div style={{ fontSize: 14, fontWeight: 600 }}>New Template</div>
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? "Edit Template" : "Create Template"}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <Input
            label="Template Name"
            value={formName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)}
            placeholder="e.g. Welcome Series"
          />
          <Input
            label="Subject Line"
            value={formSubject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormSubject(e.target.value)}
            placeholder="e.g. Welcome to {{company}}!"
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Body (HTML)</label>
            <textarea
              style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none", height: 160, resize: "none", fontFamily: "inherit" }}
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="<p>Hello {{first_name}},</p>"
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8 }}>
            <button className="pillBtn" onClick={() => setIsModalOpen(false)} type="button">Cancel</button>
            <button className="pillBtn" onClick={handleSave} type="button">{editingTemplate ? "Save Changes" : "Create Template"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
