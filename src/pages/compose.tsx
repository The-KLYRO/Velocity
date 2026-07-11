import { useState } from "react";
import { TopBar } from "../layout/topbar";
import { Button } from "../components/ui";
import { useTemplateStore } from "../stores/template-store";
import { useCampaignStore } from "../stores/campaign-store";
import { useSendingStore } from "../stores/sending-store";
import { useRecipientStore } from "../stores/recipient-store";
import { useSmtpStore } from "../stores/smtp-store";
import { useSettingsStore } from "../stores/settings-store";

const systemVars = ["{{first_name}}", "{{last_name}}", "{{email}}"];
const customVars = ["{{company}}", "{{industry}}", "{{last_order_id}}"];

export function ComposePage() {
  const { templates, addTemplate } = useTemplateStore();
  const { addCampaign } = useCampaignStore();
  const { startSending } = useSendingStore();
  const { recipients } = useRecipientStore();
  const { activeAccount } = useSmtpStore();
  const { signature } = useSettingsStore();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(
    `<p>Hi {'{{first_name}}'},</p>\n<br />\n<p>\n  I noticed that your company, {'{{company}}'}, has been expanding its reach lately.\n  We've developed a high-velocity solution at Lumina that could streamline your\n  operations significantly.\n</p>\n<br />\n<p>Would you be open to a 5-minute chat next Tuesday?</p>\n<br />\n<p>${signature.replace(/\n/g, "<br />")}</p>`
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const handleSaveTemplate = () => {
    const newTemplate = {
      id: `tpl-${Date.now()}`,
      name: subject || "Untitled Template",
      subject,
      bodyHtml: body,
      variables: systemVars.concat(customVars).map((v) => v.replace(/[{}]/g, "")),
      createdAt: new Date(),
    };
    addTemplate(newTemplate);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleSendNow = () => {
    if (!activeAccount) return;
    const recipientIds = to
      ? to.split(",").map((_, i) => `r-imported-${Date.now()}-${i}`)
      : recipients.filter((r) => r.status === "active").map((r) => r.id);

    const campaign = {
      id: `camp-${Date.now()}`,
      name: subject || "Quick Send",
      status: "running" as const,
      templateId: selectedTemplate || undefined,
      createdAt: new Date(),
      sentCount: 0,
      totalCount: recipientIds.length,
    };
    addCampaign(campaign);
    startSending(campaign.id, recipientIds.length);
  };

  const loadTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.bodyHtml);
      setSelectedTemplate(templateId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Bulk Management" searchPlaceholder="Search templates..." />

      <div className="flex-1 p-8 flex gap-8">
        <div className="flex-1 flex flex-col glass-panel rounded-2xl shadow-2xl overflow-hidden relative border border-primary/20">
          <div className="bg-surface-container-highest/50 px-6 py-4 flex items-center justify-between border-b border-glass-stroke">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">New Message</h3>
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 hover:bg-white/5 rounded-md text-on-surface-variant">
                <span className="material-symbols-outlined">minimize</span>
              </button>
              <button className="p-1.5 hover:bg-white/5 rounded-md text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          <div className="px-6 py-2 bg-surface-container-lowest/40 space-y-1">
            <div className="flex items-center py-2 border-b border-glass-stroke">
              <span className="w-20 text-on-surface-variant font-label-md text-label-md">To</span>
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline-variant"
                placeholder="Recipients (comma separated)..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
              <div className="flex gap-2 text-label-sm font-label-sm text-primary">
                <button className="hover:underline">Cc</button>
                <button className="hover:underline">Bcc</button>
              </div>
            </div>
            <div className="flex items-center py-2 border-b border-glass-stroke">
              <span className="w-20 text-on-surface-variant font-label-md text-label-md">Subject</span>
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline-variant"
                placeholder="Add a subject line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="px-6 py-3 border-b border-glass-stroke bg-surface-container/30 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all" title="Bold">
                <span className="material-symbols-outlined">format_bold</span>
              </button>
              <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all" title="Italic">
                <span className="material-symbols-outlined">format_italic</span>
              </button>
              <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all" title="Underline">
                <span className="material-symbols-outlined">format_underlined</span>
              </button>
              <div className="w-px h-6 bg-glass-stroke mx-1" />
              <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all" title="List">
                <span className="material-symbols-outlined">format_list_bulleted</span>
              </button>
              <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all" title="Link">
                <span className="material-symbols-outlined">link</span>
              </button>
              <div className="w-px h-6 bg-glass-stroke mx-1" />
              <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-primary/10 hover:text-primary rounded-lg transition-all text-label-md font-label-md">
                <span className="material-symbols-outlined text-[18px]">data_object</span>
                Variables
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-primary/10 hover:text-primary rounded-lg transition-all text-label-md font-label-md">
                <span className="material-symbols-outlined text-[18px]">temp_preferences_custom</span>
                Templates
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all" title="Attachment">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all" title="More">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-8 bg-black/40 overflow-y-auto">
            <div
              className="min-h-full outline-none text-body-lg font-body-lg leading-relaxed text-on-surface"
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: body }}
              onBlur={(e) => setBody(e.currentTarget.innerHTML)}
            />
          </div>

          <div className="p-6 bg-surface-container/60 border-t border-glass-stroke flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl overflow-hidden shadow-lg shadow-primary/30">
                <Button variant="primary" icon="send" onClick={handleSendNow}>
                  Send Now
                </Button>
                <button className="bg-primary-container text-on-primary-container px-3 py-3 border-l border-on-primary-container/20 hover:brightness-110 transition-all">
                  <span className="material-symbols-outlined">keyboard_arrow_down</span>
                </button>
              </div>
              <Button variant="secondary" icon="schedule">
                Schedule
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" icon="save" onClick={handleSaveTemplate}>
                {showSaved ? "Saved!" : "Save Template"}
              </Button>
              <button className="p-3 text-error hover:bg-error/10 rounded-xl transition-all">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>

        <div className="w-80 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col border-tertiary/20">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">data_object</span>
                Variables
              </h4>
              <button className="p-1.5 text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                System Tags
              </p>
              <div className="grid gap-2">
                {systemVars.map((v) => (
                  <div
                    key={v}
                    className="group flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 border border-glass-stroke hover:border-tertiary/40 cursor-pointer transition-all"
                    onClick={() => {
                      navigator.clipboard.writeText(v);
                    }}
                  >
                    <span className="font-mono text-label-md text-tertiary">{v}</span>
                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 text-on-surface-variant text-[18px]">
                      content_copy
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mt-4">
                Custom Attributes
              </p>
              <div className="grid gap-2">
                {customVars.map((v) => (
                  <div
                    key={v}
                    className="group flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 border border-glass-stroke hover:border-tertiary/40 cursor-pointer transition-all"
                    onClick={() => {
                      navigator.clipboard.writeText(v);
                    }}
                  >
                    <span className="font-mono text-label-md text-tertiary">{v}</span>
                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 text-on-surface-variant text-[18px]">
                      content_copy
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-glass-stroke">
              <div className="p-4 rounded-xl bg-tertiary/5 border border-tertiary/20">
                <div className="flex items-center gap-2 mb-2 text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">info</span>
                  <span className="text-label-sm font-label-sm">Pro Tip</span>
                </div>
                <p className="text-label-sm font-label-sm text-on-surface-variant">
                  Drag and drop tags directly into the editor for instant mapping.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-secondary/20 bg-secondary/5">
            <h4 className="font-label-md text-label-md text-secondary flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              AI Optimization
            </h4>
            <p className="text-label-sm font-label-sm text-on-surface-variant mb-4">
              Lumina AI suggests a subject line change for better open rates.
            </p>
            <button className="w-full py-2 bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/30 rounded-lg transition-all font-label-sm text-label-sm">
              Apply Suggestion
            </button>
          </div>

          {templates.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border-primary/20">
              <h4 className="font-label-md text-label-md text-primary flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[20px]">description</span>
                Load Template
              </h4>
              <div className="space-y-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => loadTemplate(tpl.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-label-sm ${
                      selectedTemplate === tpl.id
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-surface-container-high/40 border-glass-stroke hover:border-primary/20 text-on-surface"
                    }`}
                  >
                    <p className="font-medium">{tpl.name}</p>
                    <p className="text-on-surface-variant text-[11px] mt-0.5 truncate">{tpl.subject}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
