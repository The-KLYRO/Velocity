import { ProgressBar } from "../components/ui";
import { useCampaignStore } from "../stores/campaign-store";

const statusIcons: Record<string, string> = {
  running: "schedule",
  paused: "warning",
  completed: "check_circle",
  draft: "edit_note",
  failed: "error",
};

const colorClasses = ["primary", "secondary", "tertiary"] as const;

function getColor(campaign: { id: string }) {
  const idx =
    campaign.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    colorClasses.length;
  return colorClasses[idx];
}

function getEstFinish(campaign: {
  status: string;
  sentCount: number;
  totalCount: number;
  createdAt: Date;
}) {
  if (campaign.status === "completed") return "Finished";
  if (campaign.status === "failed") return "Failed";
  if (campaign.status === "draft") return "Not started";
  if (campaign.status === "paused") return "Action required";
  const remaining = campaign.totalCount - campaign.sentCount;
  const minutesLeft = Math.max(1, Math.round((remaining / campaign.totalCount) * 120));
  if (minutesLeft >= 60) {
    const h = Math.floor(minutesLeft / 60);
    const m = minutesLeft % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutesLeft}m`;
}

export function CampaignsPage() {
  const { campaigns, updateCampaign, addCampaign } = useCampaignStore();

  const handlePause = (id: string) => updateCampaign(id, { status: "paused" });
  const handleResume = (id: string) => updateCampaign(id, { status: "running" });
  const handleClone = (campaign: (typeof campaigns)[number]) => {
    addCampaign({
      ...campaign,
      id: `camp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: campaign.name + " (Copy)",
      status: "draft",
      sentCount: 0,
      totalCount: campaign.totalCount,
    });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div className="kpiLabel">Active Monitoring</div>
          <div className="h2">Campaign Overview</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="pillBtn" type="button">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_list</span>
            Filters
          </button>
          <button className="pillBtn" type="button">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_month</span>
            This Week
          </button>
        </div>
      </div>

      <div className="kpiRow" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {campaigns.map((campaign) => {
          const color = getColor(campaign);
          const progress =
            campaign.totalCount > 0
              ? Math.round((campaign.sentCount / campaign.totalCount) * 100)
              : 0;
          const estFinish = getEstFinish(campaign);

          return (
            <div
              key={campaign.id}
              className="card card--pad"
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{campaign.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text2)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                      {statusIcons[campaign.status]}
                    </span>
                    {estFinish}
                  </div>
                </div>
                <span className={`status ${campaign.status === "completed" ? "status--ok" : campaign.status === "running" ? "status--warn" : campaign.status === "failed" ? "status--bad" : ""}`}>
                  {campaign.status}
                </span>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text2)", marginBottom: 6 }}>
                  <span>Delivery Progress</span>
                  <span style={{ fontWeight: 700, color: "var(--text0)" }}>{progress}%</span>
                </div>
                <ProgressBar
                  value={progress}
                  color={campaign.status === "completed" ? "success" : color}
                  showGlow={campaign.status === "running"}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 11, color: "var(--text2)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
                  {campaign.totalCount.toLocaleString()} recipients
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {campaign.status === "running" ? (
                  <button
                    onClick={() => handlePause(campaign.id)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 0", borderRadius: 12, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", color: "var(--text0)", cursor: "pointer" }}
                    type="button"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18, marginBottom: 4 }}>pause</span>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Pause</span>
                  </button>
                ) : campaign.status === "paused" || campaign.status === "failed" ? (
                  <button
                    onClick={() => handleResume(campaign.id)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 0", borderRadius: 12, background: "var(--text0)", color: "var(--bg0)", border: "none", cursor: "pointer" }}
                    type="button"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18, marginBottom: 4 }}>play_arrow</span>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Resume</span>
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 0", borderRadius: 12, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", opacity: 0.3, cursor: "not-allowed" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, marginBottom: 4 }}>play_arrow</span>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Resume</span>
                  </div>
                )}
                <button
                  onClick={() => handleClone(campaign)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 0", borderRadius: 12, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", color: "var(--text1)", cursor: "pointer" }}
                  type="button"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginBottom: 4 }}>content_copy</span>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Clone</span>
                </button>
                <button
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 0", borderRadius: 12, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", color: "var(--text1)", cursor: "pointer" }}
                  type="button"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginBottom: 4 }}>monitoring</span>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Report</span>
                </button>
              </div>
            </div>
          );
        })}

        <button className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, minHeight: 300, borderStyle: "dashed", cursor: "pointer", background: "transparent" }} type="button">
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--text2)" }}>add</span>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text0)" }}>Start New Campaign</div>
            <div style={{ fontSize: 11, color: "var(--text2)", maxWidth: 200 }}>Automate your next bulk dispatch.</div>
          </div>
        </button>
      </div>

      <div className="card" style={{ marginTop: 14, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, borderLeft: "3px solid var(--text0)" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 9, color: "var(--text2)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em" }}>Network Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text0)", fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--good)" }} />
              Optimal
            </div>
          </div>
          <div style={{ width: 1, height: 24, background: "var(--stroke0)" }} />
          <div>
            <div style={{ fontSize: 9, color: "var(--text2)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em" }}>Throughput</div>
            <div style={{ fontSize: 12, color: "var(--text0)", fontWeight: 600 }}>2.4k req/sec</div>
          </div>
          <div style={{ width: 1, height: 24, background: "var(--stroke0)" }} />
          <div>
            <div style={{ fontSize: 9, color: "var(--text2)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em" }}>Queue</div>
            <div style={{ fontSize: 12, color: "var(--text0)", fontWeight: 600 }}>0 pending</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--text2)", display: "flex", alignItems: "center", gap: 6 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>cloud_done</span>
          All systems operational
        </div>
      </div>
    </div>
  );
}
