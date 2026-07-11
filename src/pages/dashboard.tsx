import { useState, useEffect } from "react";
import { useCampaignStore } from "../stores/campaign-store";
import { useSendingStore } from "../stores/sending-store";
import { useQueueStore } from "../stores/queue-store";
import { useTemplateStore } from "../stores/template-store";
import { useSmtpStore } from "../stores/smtp-store";
import * as api from "../lib/tauri-api";

type DashboardTab = "overview" | "analytics" | "templates";

export function DashboardPage() {
  const [activeTab] = useState<DashboardTab>("overview");

  return (
    <div>
      <div>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "templates" && <TemplatesTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns);
  const queueItems = useQueueStore((s) => s.items);
  const sending = useSendingStore((s) => s);
  const { accounts, fetchAccounts } = useSmtpStore();
  const [stats, setStats] = useState<api.DashboardStats | null>(null);

  useEffect(() => {
    fetchCampaigns();
    fetchAccounts();
    api.fetchDashboardStats().then(setStats).catch(() => {});
  }, [fetchCampaigns, fetchAccounts]);

  const activeAccount = accounts.find((a) => a.isConnected) ?? accounts[0] ?? null;
  const totalSent = stats?.totalSent ?? campaigns.reduce((sum, c) => sum + c.totalSent, 0);
  const totalTarget = campaigns.reduce((sum, c) => sum + c.totalSent, 0);
  const deliveryRate = totalTarget > 0 ? ((totalSent / totalTarget) * 100).toFixed(1) : "0";
  const quotaUsed = sending.isSending ? sending.sentCount : totalSent;
  const dailyLimit = activeAccount?.dailyLimit ?? 500;
  const quotaRemaining = Math.max(0, dailyLimit - quotaUsed);

  const recentActivity = [...campaigns]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)
    .map((c) => ({
      event: c.name,
      target: `${c.totalSent.toLocaleString()} contacts`,
      status: c.status === "active" ? "active" : "paused",
      time: c.createdAt.toLocaleDateString(),
    }));

  const runningCampaigns = campaigns.filter(
    (c) => c.status === "active" || c.status === "paused"
  );

  const queueDisplay = runningCampaigns.map((c) => {
    const campaignQueueItems = queueItems.filter((q) => q.campaignId === c.id);
    const hasPending = campaignQueueItems.some((q) => q.status === "pending");
    const progress = c.totalSent > 0 ? 100 : 0;
    return {
      name: c.name,
      sent: c.totalSent,
      total: c.totalSent,
      progress,
      waiting: c.status === "paused" || hasPending,
    };
  });

  return (
    <>
      <div className="kpiRow">
        <div className="card kpi">
          <div className="kpiLabel">Today's Sends</div>
          <div className="kpiValueRow">
            <div className="kpiValue">{totalSent.toLocaleString()}</div>
            <div className="delta delta--pos">{campaigns.length} campaigns</div>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpiLabel">Quota Remaining</div>
          <div className="kpiValueRow">
            <div className="kpiValue">{quotaRemaining.toLocaleString()}</div>
            <div className="delta delta--pos">{dailyLimit.toLocaleString()} daily limit</div>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpiLabel">Delivery Rate</div>
          <div className="kpiValueRow">
            <div className="kpiValue">{deliveryRate}%</div>
            <div className="delta delta--pos">{totalTarget.toLocaleString()} total</div>
          </div>
        </div>
      </div>

      <div className="dashMid">
        <section className="card" style={{ padding: 14, minHeight: 340 }}>
          <div className="txHeader">
            <div className="txTitle">Recent Activity</div>
          </div>
          <div className="txStack">
            {recentActivity.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text2)", padding: "20px 0" }}>
                No recent activity
              </div>
            ) : recentActivity.map((item, i) => (
              <div className="txRow" key={i}>
                <div className="who">
                  <div className="txAvatar" style={{ background: `linear-gradient(140deg, var(--text1), var(--text2))` }} />
                  <div className="whoMeta">
                    <div className="whoName">{item.event}</div>
                    <div className="whoHandle">{item.target}</div>
                  </div>
                </div>
                <div className="txRight">
                  <div className="txAmount" style={{ fontSize: 11 }}>
                    <span className={`status ${item.status === "completed" ? "status--ok" : item.status === "active" ? "status--warn" : "status--bad"}`}>
                      {item.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text2)" }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: 14, minHeight: 340 }}>
          <div className="panelTitle">Sending Queue</div>
          <div className="txStack">
            {queueDisplay.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text2)", padding: "20px 0" }}>
                No active campaigns in queue
              </div>
            ) : queueDisplay.map((item, i) => (
              <div key={i} className="txRow" style={{ opacity: item.waiting ? 0.6 : 1 }}>
                <div className="who">
                  <div className="whoMeta">
                    <div className="whoName">{item.name}</div>
                    <div className="whoHandle">
                      {item.waiting
                        ? "Waiting for quota reset..."
                        : `${item.sent.toLocaleString()} of ${item.total.toLocaleString()} sent`}
                    </div>
                  </div>
                </div>
                <div className="txRight">
                  {item.waiting ? (
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--text2)" }}>schedule</span>
                  ) : (
                    <span className="txAmount">{item.progress}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--stroke0)" }}>
            <div style={{ fontSize: 11, color: "var(--text2)", display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--warn)" }}>info</span>
              Projected completion: <span style={{ color: "var(--text0)", fontWeight: 600 }}>4h 12m</span>
            </div>
          </div>
        </section>
      </div>

      <div className="gridBottom">
        <div className="card card--pad">
          <div className="panelTitle">Delivery Rate</div>
          <div style={{ fontSize: 20, fontWeight: 650, letterSpacing: "-0.2px" }}>{deliveryRate}%</div>
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {recentActivity.map((item, i) => (
              <div className="row" key={i}>
                <div className="who">
                  <div className="whoMeta">
                    <div className="whoName">{item.event}</div>
                  </div>
                </div>
                <div className="moneyAside">
                  <span className={`status ${item.status === "completed" ? "status--ok" : item.status === "active" ? "status--warn" : "status--bad"}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card card--pad">
          <div className="panelTitle">Quick Stats</div>
          <div style={{ display: "grid", gap: 10 }}>
            <div className="row">
              <div className="who">
                <div className="whoMeta">
                  <div className="whoName">Total Campaigns</div>
                </div>
              </div>
              <div className="money">{campaigns.length}</div>
            </div>
            <div className="row">
              <div className="who">
                <div className="whoMeta">
                  <div className="whoName">Total Recipients</div>
                </div>
              </div>
              <div className="money">{(stats?.totalRecipients ?? 0).toLocaleString()}</div>
            </div>
            <div className="row">
              <div className="who">
                <div className="whoMeta">
                  <div className="whoName">Total Sent</div>
                </div>
              </div>
              <div className="money">{totalSent.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AnalyticsTab() {
  const { campaigns, fetchCampaigns } = useCampaignStore();
  const [stats, setStats] = useState<api.DashboardStats | null>(null);

  useEffect(() => {
    fetchCampaigns();
    api.fetchDashboardStats().then(setStats).catch(() => {});
  }, [fetchCampaigns]);

  const totalSent = stats?.totalSent ?? campaigns.reduce((sum, c) => sum + c.totalSent, 0);
  const totalRecipients = campaigns.reduce((sum, c) => sum + c.totalSent, 0);
  const deliveryRate = totalRecipients > 0 ? ((totalSent / totalRecipients) * 100).toFixed(1) : "0";
  const completedCampaigns = campaigns.filter((c) => c.status === "archived").length;

  const handleExport = async () => {
    try {
      const csv = await api.exportLogsCsv();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "report.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div className="kpiLabel">Analytics Overview</div>
          <div className="h2">Track your campaign performance</div>
        </div>
        <button className="pillBtn" onClick={handleExport} type="button">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
          Export Report
        </button>
      </div>

      <div className="kpiRow">
        <div className="card kpi">
          <div className="kpiLabel">Total Sent</div>
          <div className="kpiValueRow">
            <div className="kpiValue">{totalSent.toLocaleString()}</div>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpiLabel">Delivery Rate</div>
          <div className="kpiValueRow">
            <div className="kpiValue">{deliveryRate}%</div>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpiLabel">Active Campaigns</div>
          <div className="kpiValueRow">
            <div className="kpiValue">{String(campaigns.length - completedCampaigns)}</div>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpiLabel">Completed</div>
          <div className="kpiValueRow">
            <div className="kpiValue">{String(completedCampaigns)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatesTab() {
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

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", zIndex: 1000 }}>
          <div className="card card--pad" style={{ width: 480, maxWidth: "90vw" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Template Name</label>
                <input
                  style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Welcome Series"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject Line</label>
                <input
                  style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }}
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Welcome to {{company}}!"
                />
              </div>
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
          </div>
        </div>
      )}
    </div>
  );
}
