import { useState } from "react";
import { TopBar } from "../layout/topbar";
import { GlassCard, Input, Button, Toast } from "../components/ui";
import { useSettingsStore } from "../stores/settings-store";

export function SettingsPage() {
  const {
    delayMs, retryCount, dailyLimit, batchSize,
    notifications, tracking, signature,
    setDelayMs, setRetryCount, setDailyLimit, setBatchSize,
    toggleNotification, toggleTracking, setSignature,
  } = useSettingsStore();

  const [showToast, setShowToast] = useState(false);
  const [localDelay, setLocalDelay] = useState(String(delayMs));
  const [localRetry, setLocalRetry] = useState(String(retryCount));
  const [localLimit, setLocalLimit] = useState(String(dailyLimit));
  const [localBatch, setLocalBatch] = useState(String(batchSize));

  const handleSave = () => {
    setDelayMs(Number(localDelay) || 1000);
    setRetryCount(Number(localRetry) || 3);
    setDailyLimit(Number(localLimit) || 500);
    setBatchSize(Number(localBatch) || 50);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Settings" />

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Application Settings</h3>
            <p className="text-label-md text-on-surface-variant">Configure your sending preferences</p>
          </div>

          <GlassCard>
            <h4 className="font-headline-md text-on-surface mb-6">Sending Defaults</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Delay Between Emails (ms)" type="number" value={localDelay} onChange={(e) => setLocalDelay(e.target.value)} />
              <Input label="Retry Count" type="number" value={localRetry} onChange={(e) => setLocalRetry(e.target.value)} />
              <Input label="Daily Send Limit" type="number" value={localLimit} onChange={(e) => setLocalLimit(e.target.value)} />
              <Input label="Batch Size" type="number" value={localBatch} onChange={(e) => setLocalBatch(e.target.value)} />
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="font-headline-md text-on-surface mb-6">Notifications</h4>
            <div className="space-y-4">
              {([
                { key: "campaignCompleted" as const, label: "Campaign Completed", description: "Get notified when a campaign finishes sending" },
                { key: "bounceAlerts" as const, label: "Bounce Alerts", description: "Receive alerts for bounced emails" },
                { key: "dailySummary" as const, label: "Daily Summary", description: "Get a daily summary of sending activity" },
              ]).map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-high/30 border border-glass-stroke">
                  <div>
                    <p className="text-label-md text-on-surface font-medium">{item.label}</p>
                    <p className="text-label-sm text-on-surface-variant">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={() => toggleNotification(item.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="font-headline-md text-on-surface mb-6">Email Signature</h4>
            <div className="space-y-4">
              <textarea
                className="w-full p-4 rounded-xl bg-black/40 min-h-[150px] text-body-md text-on-surface outline-none border border-glass-stroke focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="font-headline-md text-on-surface mb-6">Tracking</h4>
            <div className="space-y-4">
              {([
                { key: "openTracking" as const, label: "Open Tracking", description: "Track when recipients open your emails" },
                { key: "clickTracking" as const, label: "Click Tracking", description: "Track link clicks in your emails" },
              ]).map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-high/30 border border-glass-stroke">
                  <div>
                    <p className="text-label-md text-on-surface font-medium">{item.label}</p>
                    <p className="text-label-sm text-on-surface-variant">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tracking[item.key]}
                      onChange={() => toggleTracking(item.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="flex justify-end gap-4">
            <Button variant="secondary">Cancel</Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast message="Settings saved" description="Your preferences have been updated." type="success" onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
