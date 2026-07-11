import { TopBar } from "../layout/topbar";
import { GlassCard, Input, Button } from "../components/ui";

export function SettingsPage() {
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
              <Input label="Delay Between Emails (ms)" type="number" defaultValue="1000" />
              <Input label="Retry Count" type="number" defaultValue="3" />
              <Input label="Daily Send Limit" type="number" defaultValue="500" />
              <Input label="Batch Size" type="number" defaultValue="50" />
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="font-headline-md text-on-surface mb-6">Notifications</h4>
            <div className="space-y-4">
              {[
                { label: "Campaign Completed", description: "Get notified when a campaign finishes sending" },
                { label: "Bounce Alerts", description: "Receive alerts for bounced emails" },
                { label: "Daily Summary", description: "Get a daily summary of sending activity" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-high/30 border border-glass-stroke">
                  <div>
                    <p className="text-label-md text-on-surface font-medium">{item.label}</p>
                    <p className="text-label-sm text-on-surface-variant">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="font-headline-md text-on-surface mb-6">Email Signature</h4>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/40 min-h-[150px] text-body-md text-on-surface outline-none" contentEditable suppressContentEditableWarning>
                <p>Best regards,</p>
                <p>Your Name</p>
                <p>Company Name</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="font-headline-md text-on-surface mb-6">Tracking</h4>
            <div className="space-y-4">
              {[
                { label: "Open Tracking", description: "Track when recipients open your emails" },
                { label: "Click Tracking", description: "Track link clicks in your emails" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-high/30 border border-glass-stroke">
                  <div>
                    <p className="text-label-md text-on-surface font-medium">{item.label}</p>
                    <p className="text-label-sm text-on-surface-variant">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="flex justify-end gap-4">
            <Button variant="secondary">Cancel</Button>
            <Button>Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
