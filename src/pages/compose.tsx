import { useState } from "react";
import { useTemplateStore } from "../stores/template-store";
import { useCampaignStore } from "../stores/campaign-store";
import { useSendingStore } from "../stores/sending-store";
import { useRecipientStore } from "../stores/recipient-store";
import { useSmtpStore } from "../stores/smtp-store";
import { useSettingsStore } from "../stores/settings-store";

const systemVars = ["{{first_name}}", "{{last_name}}", "{{email}}"];
const customVars = ["{{company}}", "{{industry}}", "{{last_order_id}}"];

export function ComposePage() {
  const { addTemplate } = useTemplateStore();
  const { addCampaign } = useCampaignStore();
  const { startSending } = useSendingStore();
  const { recipients } = useRecipientStore();
  const { activeAccount } = useSmtpStore();
  const { signature } = useSettingsStore();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(
    `<p>Hi {'{{first_name}}'},</p>\n<br />\n<p>\n  I noticed that your company, {'{{company}}'}, has been expanding its reach lately.\n  We've developed a high-velocity solution at Velocity that could streamline your\n  operations significantly.\n</p>\n<br />\n<p>Would you be open to a 5-minute chat next Tuesday?</p>\n<br />\n<p>${signature.replace(/\n/g, "<br />")}</p>`
  );
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
      templateId: undefined,
      createdAt: new Date(),
      sentCount: 0,
      totalCount: recipientIds.length,
    };
    addCampaign(campaign);
    startSending(campaign.id, recipientIds.length);
  };

  return (
    <div style={{ display: "flex", gap: 16, height: "100%" }}>
      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--stroke0)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--stroke0)" }}>
            <span style={{ width: 64, color: "var(--text2)", fontSize: 12 }}>To</span>
            <input
              style={{ flex: 1, background: "transparent", border: "none", color: "var(--text0)", fontSize: 13, outline: "none" }}
              placeholder="Recipients (comma separated)..."
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, fontSize: 11, color: "var(--primary)" }}>
              <button style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>Cc</button>
              <button style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>Bcc</button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", padding: "8px 0" }}>
            <span style={{ width: 64, color: "var(--text2)", fontSize: 12 }}>Subject</span>
            <input
              style={{ flex: 1, background: "transparent", border: "none", color: "var(--text0)", fontSize: 13, outline: "none" }}
              placeholder="Add a subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>

        <div style={{ flex: 1, padding: 18, background: "rgba(0,0,0,0.2)", overflow: "auto" }}>
          <div
            style={{ minHeight: "100%", outline: "none", fontSize: 14, lineHeight: 1.6, color: "var(--text0)" }}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: body }}
            onBlur={(e) => setBody(e.currentTarget.innerHTML)}
          />
        </div>

        <div style={{ padding: 12, borderTop: "1px solid var(--stroke0)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSendNow} className="pillBtn" type="button">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
              Send Now
            </button>
            <button className="pillBtn" type="button">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
              Schedule
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSaveTemplate} className="pillBtn" type="button">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
              {showSaved ? "Saved!" : "Save Template"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 10 }}>Variables</div>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>System Tags</div>
            {systemVars.map((v) => (
              <div
                key={v}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 10px", borderRadius: 12, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", cursor: "pointer" }}
                onClick={() => navigator.clipboard.writeText(v)}
              >
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--warn)" }}>{v}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--text2)" }}>content_copy</span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 8 }}>Custom Attributes</div>
            {customVars.map((v) => (
              <div
                key={v}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 10px", borderRadius: 12, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", cursor: "pointer" }}
                onClick={() => navigator.clipboard.writeText(v)}
              >
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--warn)" }}>{v}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--text2)" }}>content_copy</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
