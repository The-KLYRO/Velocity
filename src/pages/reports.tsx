import { TopBar } from "../layout/topbar";
import { GlassCard, StatCard, Badge } from "../components/ui";

const mockLogs = [
  { campaign: "Summer Sale", recipient: "john@example.com", event: "Delivered", status: "completed", time: "2 mins ago" },
  { campaign: "Newsletter", recipient: "jane@test.com", event: "Opened", status: "active", time: "5 mins ago" },
  { campaign: "Re-engagement", recipient: "bob@old.com", event: "Bounced", status: "failed", time: "12 mins ago" },
  { campaign: "Product Launch", recipient: "alice@company.io", event: "Clicked", status: "active", time: "18 mins ago" },
  { campaign: "Welcome Series", recipient: "new@user.com", event: "Sent", status: "pending", time: "25 mins ago" },
];

export function ReportsPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Reports & Analytics" searchPlaceholder="Search logs..." />

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">Analytics Overview</h3>
              <p className="text-label-md text-on-surface-variant">Track your campaign performance</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-glass-stroke rounded-xl text-label-md hover:bg-surface-bright transition-all">
              <span className="material-symbols-outlined text-lg">download</span>
              Export Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Total Sent" value="48,292" icon="send" />
            <StatCard label="Delivery Rate" value="98.4%" icon="check_circle" />
            <StatCard label="Open Rate" value="42.7%" icon="mark_email_read" />
            <StatCard label="Click Rate" value="12.3%" icon="ads_click" />
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
                        <Badge status={log.status as "completed" | "active" | "failed" | "pending"} />
                      </td>
                      <td className="px-4 py-3 text-label-sm text-on-surface-variant">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
