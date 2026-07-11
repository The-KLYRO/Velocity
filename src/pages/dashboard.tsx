import { useState, useMemo } from "react";
import { GlassCard, Button, Input, Modal, StatCard } from "../components/ui";
import { useCampaignStore } from "../stores/campaign-store";
import { useSendingStore } from "../stores/sending-store";
import { useQueueStore } from "../stores/queue-store";
import { useTemplateStore } from "../stores/template-store";
import type { Template } from "../types";

type DashboardTab = "overview" | "analytics" | "templates";

const mockLogs = [
  { campaign: "Summer Sale", recipient: "john@example.com", event: "Delivered", status: "completed" as const, time: "2 mins ago" },
  { campaign: "Newsletter", recipient: "jane@test.com", event: "Opened", status: "active" as const, time: "5 mins ago" },
  { campaign: "Re-engagement", recipient: "bob@old.com", event: "Bounced", status: "failed" as const, time: "12 mins ago" },
  { campaign: "Product Launch", recipient: "alice@company.io", event: "Clicked", status: "active" as const, time: "18 mins ago" },
  { campaign: "Welcome Series", recipient: "new@user.com", event: "Sent", status: "pending" as const, time: "25 mins ago" },
];

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
  const queueItems = useQueueStore((s) => s.items);
  const sending = useSendingStore((s) => s);

  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalTarget = campaigns.reduce((sum, c) => sum + c.totalCount, 0);
  const deliveryRate = totalTarget > 0 ? ((totalSent / totalTarget) * 100).toFixed(1) : "0";
  const quotaUsed = sending.isSending ? sending.sentCount : totalSent;
  const dailyLimit = 50000;
  const quotaRemaining = Math.max(0, dailyLimit - quotaUsed);
  const quotaPercent = Math.round(((dailyLimit - quotaRemaining) / dailyLimit) * 100);

  const recentActivity = [...campaigns]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)
    .map((c) => ({
      event: c.name,
      target: `${c.totalCount.toLocaleString()} contacts`,
      status: c.status === "completed" ? "completed" : c.status === "failed" ? "failed" : "active",
      time: c.createdAt.toLocaleDateString(),
    }));

  const runningCampaigns = campaigns.filter(
    (c) => c.status === "running" || c.status === "paused"
  );

  const queueDisplay = runningCampaigns.map((c) => {
    const campaignQueueItems = queueItems.filter((q) => q.campaignId === c.id);
    const hasPending = campaignQueueItems.some((q) => q.status === "pending");
    const progress = c.totalCount > 0 ? Math.round((c.sentCount / c.totalCount) * 100) : 0;
    return {
      name: c.name,
      sent: c.sentCount,
      total: c.totalCount,
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
            <div className="delta delta--pos">{quotaPercent}%</div>
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
            {recentActivity.map((item, i) => (
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
              <div className="money">{totalTarget.toLocaleString()}</div>
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
  const { campaigns } = useCampaignStore();

  const stats = useMemo(() => {
    const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
    const totalRecipients = campaigns.reduce((sum, c) => sum + c.totalCount, 0);
    const deliveryRate = totalRecipients > 0 ? ((totalSent / totalRecipients) * 100).toFixed(1) : "0";
    const completedCampaigns = campaigns.filter((c) => c.status === "completed").length;
    return { totalSent, deliveryRate, completedCampaigns, totalCampaigns: campaigns.length };
  }, [campaigns]);

  const handleExport = () => {
    const csv = [
      "Campaign,Recipient,Event,Status,Time",
      ...mockLogs.map((l) => `${l.campaign},${l.recipient},${l.event},${l.status},${l.time}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Analytics Overview</h3>
          <p className="text-label-md text-on-surface-variant">Track your campaign performance</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-glass-stroke rounded-xl text-label-md hover:bg-surface-bright transition-all"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Sent" value={stats.totalSent.toLocaleString()} icon="send" />
        <StatCard label="Delivery Rate" value={`${stats.deliveryRate}%`} icon="check_circle" />
        <StatCard label="Active Campaigns" value={String(stats.totalCampaigns - stats.completedCampaigns)} icon="campaign" />
        <StatCard label="Completed" value={String(stats.completedCampaigns)} icon="task_alt" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h4 className="font-headline-md text-on-surface mb-6">Delivery Trends</h4>
          <div className="h-48 relative">
            <svg className="w-full h-full" viewBox="0 0 400 150">
              <defs>
                <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(173, 198, 255, 0.3)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path d="M0,120 Q50,100 100,80 T200,60 T300,40 T400,20" fill="none" stroke="#adc6ff" strokeWidth="2" />
              <path d="M0,120 Q50,100 100,80 T200,60 T300,40 T400,20 L400,150 L0,150 Z" fill="url(#lineGrad)" />
            </svg>
          </div>
        </GlassCard>

        <GlassCard>
          <h4 className="font-headline-md text-on-surface mb-6">Engagement Breakdown</h4>
          <div className="h-48 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-40 h-40">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2a2a" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#adc6ff" strokeWidth="8" strokeDasharray="106.8 144.5" strokeDashoffset="0" transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#ddb7ff" strokeWidth="8" strokeDasharray="53.4 197.9" strokeDashoffset="-106.8" transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#ffb786" strokeWidth="8" strokeDasharray="26.7 224.6" strokeDashoffset="-160.2" transform="rotate(-90 50 50)" />
            </svg>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-label-sm">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-on-surface-variant">Delivered (42%)</span>
            </div>
            <div className="flex items-center gap-2 text-label-sm">
              <span className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-on-surface-variant">Opened (21%)</span>
            </div>
            <div className="flex items-center gap-2 text-label-sm">
              <span className="w-3 h-3 rounded-full bg-tertiary" />
              <span className="text-on-surface-variant">Clicked (10%)</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-headline-md text-on-surface">Recent Activity Logs</h4>
          <button className="text-primary text-label-sm hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-label-sm text-outline uppercase tracking-widest">
                <th className="px-4 py-2 font-medium">Campaign</th>
                <th className="px-4 py-2 font-medium">Recipient</th>
                <th className="px-4 py-2 font-medium">Event</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {mockLogs.map((log, i) => (
                <tr key={i} className="hover:bg-surface-elevated transition-all rounded-lg">
                  <td className="px-4 py-3 font-label-md">{log.campaign}</td>
                  <td className="px-4 py-3 text-on-surface-variant font-label-md">{log.recipient}</td>
                  <td className="px-4 py-3 font-label-md">{log.event}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      log.status === "completed" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                      log.status === "active" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                      log.status === "failed" ? "bg-error/10 border-error/20 text-error" :
                      "bg-surface-bright/30 border-glass-stroke text-on-surface-variant"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-label-sm text-on-surface-variant">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function TemplatesTab() {
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
