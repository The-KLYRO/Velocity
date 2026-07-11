import { TopBar } from "../layout/topbar";
import { ProgressBar } from "../components/ui";
import { useCampaignStore } from "../stores/campaign-store";

const statusColors: Record<string, string> = {
  running: "bg-primary/10 border-primary/20 text-primary",
  paused: "bg-tertiary/10 border-tertiary/20 text-tertiary",
  completed: "bg-green-500/10 border-green-500/20 text-green-400",
  draft: "bg-surface-container-high/10 border-surface-container-high/20 text-on-surface-variant",
  failed: "bg-red-500/10 border-red-500/20 text-red-400",
};

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
    <div className="flex flex-col h-full">
      <TopBar title="Campaign Monitoring" searchPlaceholder="Search campaigns..." />

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-label-sm uppercase tracking-widest mb-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Active Monitoring
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Campaign Overview</h3>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-surface-container-high border border-glass-stroke text-label-md text-on-surface hover:bg-surface-bright transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filters
            </button>
            <button className="px-4 py-2 rounded-lg bg-surface-container-high border border-glass-stroke text-label-md text-on-surface hover:bg-surface-bright transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              This Week
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                className="glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden"
              >
                {campaign.status === "running" && (
                  <div
                    className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${color} to-transparent opacity-50`}
                  />
                )}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-headline-md text-on-surface">
                      {campaign.name}
                    </h4>
                    <p className="text-label-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">
                        {statusIcons[campaign.status]}
                      </span>
                      {estFinish}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColors[campaign.status]}`}
                  >
                    {campaign.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-label-sm text-on-surface-variant">
                    <span>Delivery Progress</span>
                    <span
                      className={`font-bold ${
                        campaign.status === "completed"
                          ? "text-green-400"
                          : `text-${color}`
                      }`}
                    >
                      {progress}%
                    </span>
                  </div>
                  <ProgressBar
                    value={progress}
                    color={
                      campaign.status === "completed"
                        ? "success"
                        : color
                    }
                    showGlow={campaign.status === "running"}
                  />
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center border border-glass-stroke">
                        <span className="material-symbols-outlined text-on-surface-variant text-sm">
                          group
                        </span>
                      </div>
                      <div>
                        <p className="text-label-sm text-on-surface leading-none">
                          {campaign.totalCount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-on-surface-variant uppercase">
                          Recipients
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  {campaign.status === "running" ? (
                    <button
                      onClick={() => handlePause(campaign.id)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-high/50 hover:bg-primary/20 hover:text-primary transition-all group border border-transparent hover:border-primary/30"
                    >
                      <span className="material-symbols-outlined text-xl mb-1">
                        pause
                      </span>
                      <span className="text-[10px] font-bold uppercase">
                        Pause
                      </span>
                    </button>
                  ) : campaign.status === "paused" || campaign.status === "failed" ? (
                    <button
                      onClick={() => handleResume(campaign.id)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary text-on-primary hover:brightness-110 transition-all group shadow-lg shadow-primary/10"
                    >
                      <span className="material-symbols-outlined text-xl mb-1">
                        play_arrow
                      </span>
                      <span className="text-[10px] font-bold uppercase">
                        Resume
                      </span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-surface-container-lowest/50 border border-glass-stroke opacity-30 cursor-not-allowed flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-xl mb-1">
                        play_arrow
                      </span>
                      <span className="text-[10px] font-bold uppercase">
                        Resume
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => handleClone(campaign)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-high/50 hover:bg-surface-bright transition-all group border border-transparent"
                  >
                    <span className="material-symbols-outlined text-xl mb-1">
                      content_copy
                    </span>
                    <span className="text-[10px] font-bold uppercase">
                      Clone
                    </span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-high/50 hover:bg-surface-bright transition-all group border border-transparent">
                    <span className="material-symbols-outlined text-xl mb-1">
                      monitoring
                    </span>
                    <span className="text-[10px] font-bold uppercase">
                      Report
                    </span>
                  </button>
                </div>
              </div>
            );
          })}

          <button className="group relative rounded-2xl border-2 border-dashed border-glass-stroke hover:border-primary/50 flex flex-col items-center justify-center gap-4 transition-all hover:bg-primary/5 p-6 min-h-[350px]">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary">
                add
              </span>
            </div>
            <div className="text-center">
              <p className="font-headline-md text-on-surface">
                Start New Campaign
              </p>
              <p className="text-label-sm text-on-surface-variant max-w-[200px]">
                Automate your next bulk dispatch with precision targeting.
              </p>
            </div>
          </button>
        </div>

        <div className="mt-12 glass-card rounded-2xl p-6 border-l-4 border-l-primary flex flex-wrap gap-8 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="space-y-1">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest leading-none">
                Network Status
              </p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-label-md text-on-surface font-semibold">
                  Optimal
                </span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-glass-stroke" />
            <div className="space-y-1">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest leading-none">
                Throughput
              </p>
              <span className="text-label-md text-on-surface font-semibold">
                2.4k req/sec
              </span>
            </div>
            <div className="h-8 w-[1px] bg-glass-stroke" />
            <div className="space-y-1">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest leading-none">
                Queue
              </p>
              <span className="text-label-md text-on-surface font-semibold">
                0 pending
              </span>
            </div>
          </div>
          <div className="text-on-surface-variant text-label-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">
              cloud_done
            </span>
            All systems operational
          </div>
        </div>
      </div>
    </div>
  );
}
