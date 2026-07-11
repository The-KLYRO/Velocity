import { TopBar } from "../layout/topbar";
import { GlassCard, StatCard, ProgressBar } from "../components/ui";

const mockActivity = [
  { event: "Summer Sale Launch", target: "8,241 contacts", status: "completed", time: "2 mins ago" },
  { event: "List Import: Q3 Leads", target: "q3_leads_v2.csv", status: "active", time: "15 mins ago" },
  { event: "SMTP Bounce Error", target: "smtp.cluster-01", status: "failed", time: "42 mins ago" },
];

const mockQueue = [
  { name: "Newsletter-Auto_77", sent: 4200, total: 10000, progress: 42 },
  { name: "Onboarding_Sequence_01", sent: 890, total: 1200, progress: 74 },
  { name: "Re-engagement_Blast", sent: 0, total: 5000, progress: 0, waiting: true },
];

export function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Bulk Management" searchPlaceholder="Search campaigns, logs, or recipients..." />

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Today's Sends"
            value="12,842"
            trend="+12% vs yesterday"
            icon="outbox"
          />
          <GlassCard className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-label-sm text-outline uppercase tracking-wider">
                Quota Remaining
              </span>
              <div className="flex flex-col">
                <span className="font-display-lg text-on-surface">37,158</span>
                <span className="text-label-sm text-on-surface-variant">
                  of 50,000 daily limit
                </span>
              </div>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle className="stroke-glass-stroke" cx="18" cy="18" fill="none" r="16" strokeWidth="3" />
                <circle
                  className="stroke-primary progress-ring__circle"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="16"
                  strokeDasharray="100"
                  strokeDashoffset="25"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-label-sm text-primary">
                74%
              </div>
            </div>
          </GlassCard>
          <StatCard
            label="Delivery Rate"
            value="98.2%"
            trend="+0.4%"
            icon="check_circle"
          />
        </div>

        <GlassCard className="p-8 rounded-3xl mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Weekly Performance
              </h2>
              <p className="text-label-md text-on-surface-variant">
                Sending volume across active campaigns
              </p>
            </div>
            <div className="flex gap-2 bg-surface-container-highest/30 p-1 rounded-lg">
              <button className="px-4 py-1.5 rounded-md bg-surface-bright text-on-surface text-label-sm">
                Day
              </button>
              <button className="px-4 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface text-label-sm transition-colors">
                Week
              </button>
              <button className="px-4 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface text-label-sm transition-colors">
                Month
              </button>
            </div>
          </div>
          <div className="h-80 w-full relative">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(173, 198, 255, 0.3)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <line stroke="rgba(255,255,255,0.05)" x1="0" x2="1000" y1="50" y2="50" />
              <line stroke="rgba(255,255,255,0.05)" x1="0" x2="1000" y1="150" y2="150" />
              <line stroke="rgba(255,255,255,0.05)" x1="0" x2="1000" y1="250" y2="250" />
              <path
                d="M0,300 L0,220 C100,210 150,260 250,240 C350,220 400,100 500,120 C600,140 650,220 750,200 C850,180 900,50 1000,60 L1000,300 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M0,220 C100,210 150,260 250,240 C350,220 400,100 500,120 C600,140 650,220 750,200 C850,180 900,50 1000,60"
                fill="none"
                stroke="#adc6ff"
                strokeLinecap="round"
                strokeWidth="3"
                style={{ filter: "drop-shadow(0 0 8px rgba(173, 198, 255, 0.8))" }}
              />
            </svg>
            <div className="absolute bottom-[-24px] left-0 w-full flex justify-between text-label-sm text-outline">
              <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <GlassCard className="xl:col-span-2 rounded-2xl flex flex-col">
            <div className="p-6 border-b border-glass-stroke flex items-center justify-between">
              <h3 className="font-headline-md text-on-surface">Recent Activity</h3>
              <button className="text-primary text-label-sm hover:underline">View All Logs</button>
            </div>
            <div className="p-2 overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-label-sm text-outline uppercase tracking-widest">
                    <th className="px-4 py-2 font-medium">Event</th>
                    <th className="px-4 py-2 font-medium">Target</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mockActivity.map((item, i) => (
                    <tr key={i} className="group hover:bg-surface-elevated transition-all rounded-lg">
                      <td className="px-4 py-4 rounded-l-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.status === "completed" ? "bg-primary/10 text-primary" :
                            item.status === "active" ? "bg-secondary/10 text-secondary" :
                            "bg-error/10 text-error"
                          }`}>
                            <span className="material-symbols-outlined text-[18px]">
                              {item.status === "completed" ? "send" : item.status === "active" ? "person_add" : "warning"}
                            </span>
                          </div>
                          <span className="font-label-md">{item.event}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-label-md">{item.target}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                          item.status === "completed" ? "bg-green-500/10 text-green-400" :
                          item.status === "active" ? "bg-blue-500/10 text-blue-400" :
                          "bg-error/10 text-error"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 rounded-r-lg">
                        <span className="text-label-sm text-on-surface-variant">{item.time}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <GlassCard className="rounded-2xl flex flex-col h-full">
            <div className="p-6 border-b border-glass-stroke flex items-center justify-between">
              <h3 className="font-headline-md text-on-surface">Sending Queue</h3>
              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[11px] font-bold">
                LIVE
              </span>
            </div>
            <div className="p-6 flex-1 space-y-6">
              {mockQueue.map((item, i) => (
                <div key={i} className={`flex flex-col gap-3 ${item.waiting ? "opacity-60" : ""}`}>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-label-md font-bold">{item.name}</span>
                      <span className="text-label-sm text-on-surface-variant">
                        {item.waiting
                          ? "Waiting for quota reset..."
                          : `${item.sent.toLocaleString()} of ${item.total.toLocaleString()} sent`}
                      </span>
                    </div>
                    {item.waiting ? (
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                    ) : (
                      <span className="text-label-sm text-primary">{item.progress}%</span>
                    )}
                  </div>
                  <ProgressBar value={item.progress} showGlow={!item.waiting && item.progress > 0} />
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-glass-stroke">
                <div className="p-4 rounded-xl bg-surface-container-low border border-glass-stroke">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-tertiary">info</span>
                    <p className="text-label-sm text-on-surface-variant">
                      Projected completion for active queue:{" "}
                      <span className="text-on-surface font-bold">4h 12m</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
