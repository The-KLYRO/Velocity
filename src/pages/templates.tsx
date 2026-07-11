import { TopBar } from "../layout/topbar";
import { GlassCard, Button } from "../components/ui";

const mockTemplates = [
  { name: "Welcome Series", subject: "Welcome to {{company}}!", lastEdited: "2 hours ago", variables: 5 },
  { name: "Newsletter Monthly", subject: "Your monthly update from {{company}}", lastEdited: "1 day ago", variables: 3 },
  { name: "Re-engagement", subject: "We miss you, {{first_name}}!", lastEdited: "3 days ago", variables: 4 },
  { name: "Product Launch", subject: "Introducing our latest product", lastEdited: "1 week ago", variables: 6 },
];

export function TemplatesPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Templates" searchPlaceholder="Search templates..." />

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">Email Templates</h3>
              <p className="text-label-md text-on-surface-variant">Manage your email templates for campaigns</p>
            </div>
            <Button icon="add">Create Template</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTemplates.map((template, i) => (
              <GlassCard key={i} hover className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div>
                      <h4 className="font-headline-md text-on-surface">{template.name}</h4>
                      <p className="text-label-sm text-on-surface-variant">{template.lastEdited}</p>
                    </div>
                  </div>
                  <button className="p-1.5 text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-high/40 border border-glass-stroke">
                  <p className="text-label-sm text-on-surface-variant">Subject</p>
                  <p className="text-label-md text-on-surface mt-1">{template.subject}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-glass-stroke">
                  <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">data_object</span>
                    {template.variables} variables
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all">
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}

            <button className="group rounded-2xl border-2 border-dashed border-glass-stroke hover:border-primary/50 flex flex-col items-center justify-center gap-4 transition-all hover:bg-primary/5 p-6 min-h-[200px]">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl text-on-surface-variant group-hover:text-primary">add</span>
              </div>
              <p className="font-headline-md text-on-surface">New Template</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
