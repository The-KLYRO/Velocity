import { TopBar } from "../layout/topbar";
import { GlassCard, Input, Button } from "../components/ui";

export function SmtpPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="SMTP Accounts" />

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">SMTP Configuration</h3>
              <p className="text-label-md text-on-surface-variant">Configure your email sending servers</p>
            </div>
            <Button icon="add">Add Account</Button>
          </div>

          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-headline-md text-on-surface">Gmail SMTP</h4>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-label-sm text-green-400">Connected</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Email Address" type="email" defaultValue="your-email@gmail.com" />
              <Input label="App Password" type="password" defaultValue="••••••••••••" />
              <Input label="SMTP Host" defaultValue="smtp.gmail.com" />
              <Input label="Port" type="number" defaultValue="587" />
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Encryption</label>
                <select className="w-full bg-surface-container-high/50 border border-glass-stroke rounded-xl px-4 py-2.5 text-label-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all">
                  <option value="starttls">STARTTLS</option>
                  <option value="tls">TLS/SSL</option>
                  <option value="none">None</option>
                </select>
              </div>
              <Input label="Delay Between Emails (ms)" type="number" defaultValue="1000" />
              <Input label="Retry Count" type="number" defaultValue="3" />
              <Input label="Daily Send Limit" type="number" defaultValue="500" />
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-glass-stroke">
              <Button variant="secondary" icon="wifi_find">
                Test Connection
              </Button>
              <div className="flex gap-3">
                <Button variant="secondary">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-headline-md text-on-surface">Custom SMTP</h4>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-error rounded-full" />
                <span className="text-label-sm text-error">Disconnected</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Email Address" type="email" placeholder="your-email@company.com" />
              <Input label="Password" type="password" placeholder="Enter password" />
              <Input label="SMTP Host" placeholder="smtp.company.com" />
              <Input label="Port" type="number" placeholder="465" />
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Encryption</label>
                <select className="w-full bg-surface-container-high/50 border border-glass-stroke rounded-xl px-4 py-2.5 text-label-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all">
                  <option value="tls">TLS/SSL</option>
                  <option value="starttls">STARTTLS</option>
                  <option value="none">None</option>
                </select>
              </div>
              <Input label="Delay Between Emails (ms)" type="number" defaultValue="1500" />
              <Input label="Retry Count" type="number" defaultValue="5" />
              <Input label="Daily Send Limit" type="number" defaultValue="1000" />
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-glass-stroke">
              <Button variant="secondary" icon="wifi_find">
                Test Connection
              </Button>
              <div className="flex gap-3">
                <Button variant="danger">Delete</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
