import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ProgressBar, Toast } from "../components/ui";
import { useCampaignStore } from "../stores/campaign-store";
import type { Campaign } from "../types";

export function CampaignsPage() {
  const { campaigns, broadcasts, fetchCampaigns, fetchBroadcasts, addCampaign, removeCampaign, updateCampaign } = useCampaignStore();
  const navigate = useNavigate();

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    if (selectedCampaign) {
      fetchBroadcasts(selectedCampaign.id);
    }
  }, [selectedCampaign, fetchBroadcasts]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await addCampaign({ name: newName.trim(), description: newDesc.trim() || undefined, status: "active" });
    await fetchCampaigns();
    setNewName("");
    setNewDesc("");
    setShowCreateModal(false);
    showToast("Campaign created");
  };

  const handleArchive = async (id: string) => {
    await updateCampaign(id, { status: "archived" });
    showToast("Campaign archived", "info");
  };

  const handleUnarchive = async (id: string) => {
    await updateCampaign(id, { status: "active" });
    showToast("Campaign restored", "success");
  };

  const handleDelete = async (id: string) => {
    await removeCampaign(id);
    if (selectedCampaign?.id === id) setSelectedCampaign(null);
    showToast("Campaign deleted", "info");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(0,0,0,0.14)",
    border: "1px solid var(--stroke0)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "var(--text0)",
    fontSize: 13,
    outline: "none",
  };

  const activeCampaigns = campaigns.filter((c) => c.status !== "archived");
  const archivedCampaigns = campaigns.filter((c) => c.status === "archived");

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

      {/* Campaign Detail View */}
      {selectedCampaign ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button
              onClick={() => setSelectedCampaign(null)}
              style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
              Back
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{selectedCampaign.name}</div>
              {selectedCampaign.description && (
                <div style={{ fontSize: 12, color: "var(--text2)" }}>{selectedCampaign.description}</div>
              )}
            </div>
            <Button onClick={() => navigate(`/compose?campaign=${selectedCampaign.id}`)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              New Broadcast
            </Button>
          </div>

          {/* Broadcast History */}
          <div className="card card--pad" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Broadcast History</div>
            {broadcasts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: "var(--text2)", fontSize: 13 }}>
                No broadcasts yet. Send your first broadcast to this campaign.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {broadcasts.map((b) => {
                  const progress = b.totalCount > 0 ? Math.round((b.sentCount / b.totalCount) * 100) : 0;
                  return (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{b.subject}</div>
                        <div style={{ fontSize: 11, color: "var(--text2)" }}>
                          {b.sentCount.toLocaleString()} / {b.totalCount.toLocaleString()} sent
                        </div>
                      </div>
                      <div style={{ width: 120 }}>
                        <ProgressBar
                          value={progress}
                          color={b.status === "completed" ? "success" : b.status === "running" ? "primary" : "secondary"}
                          showGlow={b.status === "running"}
                        />
                      </div>
                      <span className={`status ${b.status === "completed" ? "status--ok" : b.status === "running" ? "status--warn" : b.status === "failed" ? "status--bad" : ""}`}>
                        {b.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Campaign Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            {selectedCampaign.status === "archived" ? (
              <Button variant="secondary" onClick={() => handleUnarchive(selectedCampaign.id)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>unarchive</span>
                Unarchive
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => handleArchive(selectedCampaign.id)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>archive</span>
                Archive
              </Button>
            )}
            <Button variant="danger" onClick={() => handleDelete(selectedCampaign.id)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
              Delete
            </Button>
          </div>
        </div>
      ) : (
        /* Campaign List View */
        <div>
          <div className="kpiRow" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {activeCampaigns.length === 0 && (
              <div className="card card--pad" style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 14, color: "var(--text2)" }}>No campaigns yet. Create one to start sending broadcasts.</div>
              </div>
            )}

            {activeCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="card card--pad"
                style={{ display: "flex", flexDirection: "column", gap: 14, cursor: "pointer" }}
                onClick={() => setSelectedCampaign(campaign)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{campaign.name}</div>
                    {campaign.description && (
                      <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>{campaign.description}</div>
                    )}
                  </div>
                  <span className={`status ${campaign.status === "active" ? "status--ok" : campaign.status === "paused" ? "status--warn" : ""}`}>
                    {campaign.status}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div style={{ textAlign: "center", padding: 8, borderRadius: 8, background: "rgba(0,0,0,0.14)" }}>
                    <div style={{ fontSize: 9, color: "var(--text2)", textTransform: "uppercase", fontWeight: 700 }}>Broadcasts</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text0)" }}>{campaign.broadcastCount}</div>
                  </div>
                  <div style={{ textAlign: "center", padding: 8, borderRadius: 8, background: "rgba(0,0,0,0.14)" }}>
                    <div style={{ fontSize: 9, color: "var(--text2)", textTransform: "uppercase", fontWeight: 700 }}>Total Sent</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text0)" }}>{campaign.totalSent.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: "center", padding: 8, borderRadius: 8, background: "rgba(0,0,0,0.14)" }}>
                    <div style={{ fontSize: 9, color: "var(--text2)", textTransform: "uppercase", fontWeight: 700 }}>Last Sent</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text0)" }}>
                      {campaign.lastBroadcastAt ? new Date(campaign.lastBroadcastAt).toLocaleDateString() : "Never"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/compose?campaign=${campaign.id}`); }}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 10, background: "var(--text0)", color: "var(--bg0)", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                    type="button"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
                    Send Broadcast
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCampaign(campaign); }}
                    style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", color: "var(--text1)", cursor: "pointer", display: "flex", alignItems: "center" }}
                    type="button"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>archive</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Start New Campaign */}
            <button
              className="card"
              onClick={() => setShowCreateModal(true)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, minHeight: 300, borderStyle: "dashed", cursor: "pointer", background: "transparent" }}
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--text2)" }}>add</span>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text0)" }}>Start New Campaign</div>
                <div style={{ fontSize: 11, color: "var(--text2)", maxWidth: 200 }}>Create a campaign group to send multiple broadcasts.</div>
              </div>
            </button>
          </div>

          {/* Archived */}
          {archivedCampaigns.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text2)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 10 }}>Archived</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
                {archivedCampaigns.map((c) => (
                  <div key={c.id} className="card card--pad" style={{ opacity: 0.5, cursor: "pointer" }} onClick={() => setSelectedCampaign(c)}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>{c.broadcastCount} broadcasts, {c.totalSent.toLocaleString()} sent</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Bar */}
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

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
        >
          <div style={{ background: "var(--bg1)", border: "1px solid var(--stroke1)", borderRadius: 16, padding: 24, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>New Campaign</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Campaign Name</label>
              <input
                style={inputStyle}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Product Launch Q3"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Description (optional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "none", fontFamily: "inherit" }}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What is this campaign for?"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button disabled={!newName.trim()} onClick={handleCreate}>Create Campaign</Button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
