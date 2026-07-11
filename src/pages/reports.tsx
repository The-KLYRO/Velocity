import { useMemo } from "react";
import { StatCard } from "../components/ui";
import { useCampaignStore } from "../stores/campaign-store";

const mockLogs = [
  { campaign: "Summer Sale", recipient: "john@example.com", event: "Delivered", status: "completed" as const, time: "2 mins ago" },
  { campaign: "Newsletter", recipient: "jane@test.com", event: "Opened", status: "active" as const, time: "5 mins ago" },
  { campaign: "Re-engagement", recipient: "bob@old.com", event: "Bounced", status: "failed" as const, time: "12 mins ago" },
  { campaign: "Product Launch", recipient: "alice@company.io", event: "Clicked", status: "active" as const, time: "18 mins ago" },
  { campaign: "Welcome Series", recipient: "new@user.com", event: "Sent", status: "pending" as const, time: "25 mins ago" },
];

export function ReportsPage() {
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
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div className="h2">Analytics Overview</div>
          <div style={{ fontSize: 12, color: "var(--text2)" }}>Track your campaign performance</div>
        </div>
        <button className="pillBtn" onClick={handleExport} type="button">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
          Export Report
        </button>
      </div>

      <div className="kpiRow">
        <StatCard label="Total Sent" value={stats.totalSent.toLocaleString()} icon="send" />
        <StatCard label="Delivery Rate" value={`${stats.deliveryRate}%`} icon="check_circle" />
        <StatCard label="Active Campaigns" value={String(stats.totalCampaigns - stats.completedCampaigns)} icon="campaign" />
        <StatCard label="Completed" value={String(stats.completedCampaigns)} icon="task_alt" />
      </div>

      <div className="gridBottom">
        <div className="card card--pad">
          <div className="panelTitle">Delivery Trends</div>
          <div style={{ height: 180, position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 400 150">
              <defs>
                <linearGradient id="lineGradReport" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path d="M0,120 Q50,100 100,80 T200,60 T300,40 T400,20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
              <path d="M0,120 Q50,100 100,80 T200,60 T300,40 T400,20 L400,150 L0,150 Z" fill="url(#lineGradReport)" />
            </svg>
          </div>
        </div>

        <div className="card card--pad">
          <div className="panelTitle">Engagement Breakdown</div>
          <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 100 100" style={{ width: 140, height: 140 }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--panel2)" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--text0)" strokeWidth="8" strokeDasharray="106.8 144.5" strokeDashoffset="0" transform="rotate(-90 50 50)" opacity="0.6" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--text1)" strokeWidth="8" strokeDasharray="53.4 197.9" strokeDashoffset="-106.8" transform="rotate(-90 50 50)" opacity="0.5" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--warn)" strokeWidth="8" strokeDasharray="26.7 224.6" strokeDashoffset="-160.2" transform="rotate(-90 50 50)" opacity="0.6" />
            </svg>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text0)", opacity: 0.6 }} />
              <span style={{ color: "var(--text2)" }}>Delivered (42%)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text1)", opacity: 0.5 }} />
              <span style={{ color: "var(--text2)" }}>Opened (21%)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--warn)", opacity: 0.6 }} />
              <span style={{ color: "var(--text2)" }}>Clicked (10%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card card--pad" style={{ marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div className="panelTitle" style={{ marginBottom: 0 }}>Recent Activity Logs</div>
          <span style={{ fontSize: 11, color: "var(--text2)", cursor: "pointer" }}>View All</span>
        </div>
        <div className="historyHeader">
          <div></div>
          <div>Campaign</div>
          <div>Recipient</div>
          <div>Event</div>
          <div>Status</div>
        </div>
        {mockLogs.map((log, i) => (
          <div className="historyRow" key={i}>
            <div style={{ width: 40 }} />
            <div className="cellMain">{log.campaign}</div>
            <div className="cellSub" style={{ fontSize: 12 }}>{log.recipient}</div>
            <div className="cellSub" style={{ fontSize: 12 }}>{log.event}</div>
            <div>
              <span className={`status ${log.status === "completed" ? "status--ok" : log.status === "active" ? "status--warn" : log.status === "failed" ? "status--bad" : ""}`}>
                {log.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
