import { useState, useEffect } from "react";
import { Button, Toast } from "../components/ui";
import { useSettingsStore } from "../stores/settings-store";

export function SettingsPage() {
  const {
    delayMs, retryCount, dailyLimit, batchSize,
    notifications, tracking, signature,
    fetchSettings, setDelayMs, setRetryCount, setDailyLimit, setBatchSize,
    toggleNotification, toggleTracking, setSignature, saveAll,
  } = useSettingsStore();

  const [showToast, setShowToast] = useState(false);
  const [localDelay, setLocalDelay] = useState(String(delayMs));
  const [localRetry, setLocalRetry] = useState(String(retryCount));
  const [localLimit, setLocalLimit] = useState(String(dailyLimit));
  const [localBatch, setLocalBatch] = useState(String(batchSize));

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setLocalDelay(String(delayMs));
    setLocalRetry(String(retryCount));
    setLocalLimit(String(dailyLimit));
    setLocalBatch(String(batchSize));
  }, [delayMs, retryCount, dailyLimit, batchSize]);

  const handleSave = async () => {
    setDelayMs(Number(localDelay) || 1000);
    setRetryCount(Number(localRetry) || 3);
    setDailyLimit(Number(localLimit) || 500);
    setBatchSize(Number(localBatch) || 50);
    await saveAll();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div>
      <div style={{ maxWidth: 768, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div className="h2">Application Settings</div>
          <div style={{ fontSize: 12, color: "var(--text2)" }}>Configure your sending preferences</div>
        </div>

        <div className="card card--pad" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Sending Defaults</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Delay Between Emails (ms)</label>
              <input type="number" value={localDelay} onChange={(e) => setLocalDelay(e.target.value)}
                style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Retry Count</label>
              <input type="number" value={localRetry} onChange={(e) => setLocalRetry(e.target.value)}
                style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Daily Send Limit</label>
              <input type="number" value={localLimit} onChange={(e) => setLocalLimit(e.target.value)}
                style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Batch Size</label>
              <input type="number" value={localBatch} onChange={(e) => setLocalBatch(e.target.value)}
                style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }} />
            </div>
          </div>
        </div>

        <div className="card card--pad" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Notifications</div>
          <div style={{ display: "grid", gap: 10 }}>
            {([
              { key: "campaignCompleted" as const, label: "Campaign Completed", description: "Get notified when a campaign finishes sending" },
              { key: "bounceAlerts" as const, label: "Bounce Alerts", description: "Receive alerts for bounced emails" },
              { key: "dailySummary" as const, label: "Daily Summary", description: "Get a daily summary of sending activity" },
            ]).map((item) => (
              <div key={item.key} className="txRow">
                <div className="who">
                  <div className="whoMeta">
                    <div className="whoName">{item.label}</div>
                    <div className="whoHandle">{item.description}</div>
                  </div>
                </div>
                <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={() => toggleNotification(item.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer peer-checked:bg-[var(--text0)] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" style={{ background: "var(--panel2)" }} />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="card card--pad" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Email Signature</div>
          <textarea
            style={{ width: "100%", padding: 14, borderRadius: 12, background: "rgba(0,0,0,0.2)", minHeight: 150, color: "var(--text0)", outline: "none", border: "1px solid var(--stroke0)", resize: "none", fontFamily: "inherit", fontSize: 14 }}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
          />
        </div>

        <div className="card card--pad" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Tracking</div>
          <div style={{ display: "grid", gap: 10 }}>
            {([
              { key: "openTracking" as const, label: "Open Tracking", description: "Track when recipients open your emails" },
              { key: "clickTracking" as const, label: "Click Tracking", description: "Track link clicks in your emails" },
            ]).map((item) => (
              <div key={item.key} className="txRow">
                <div className="who">
                  <div className="whoMeta">
                    <div className="whoName">{item.label}</div>
                    <div className="whoHandle">{item.description}</div>
                  </div>
                </div>
                <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={tracking[item.key]}
                    onChange={() => toggleTracking(item.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer peer-checked:bg-[var(--text0)] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" style={{ background: "var(--panel2)" }} />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="secondary">Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>

      {showToast && (
        <Toast message="Settings saved" description="Your preferences have been updated." type="success" onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
