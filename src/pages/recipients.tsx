import { useState } from "react";
import { TopBar } from "../layout/topbar";
import { Button, Tabs, Badge, Pagination, Avatar } from "../components/ui";

const mockRecipients = [
  { name: "Julianne Smith", role: "Marketing Lead", email: "julianne.s@acme-corp.io", company: "Acme Corp", status: "valid" as const, lastSent: "Oct 24, 2023" },
  { name: "Marcus Reed", role: "CTO", email: "m.reed@stellar-dynamics.com", company: "Stellar Dynamics", status: "valid" as const, lastSent: "Yesterday" },
  { name: "Ben Kessler", role: "Product Manager", email: "ben@outdated-domain.net", company: "Nebula Soft", status: "invalid" as const, lastSent: "Never" },
  { name: "Elena Lopez", role: "Creative Director", email: "elena.l@prism-design.co", company: "Prism Design", status: "valid" as const, lastSent: "2 days ago" },
  { name: "David Fischer", role: "Operations", email: "fischer.d@logistics-v2.com", company: "Logistics V2", status: "valid" as const, lastSent: "Oct 20, 2023" },
];

const tabs = [
  { id: "all", label: "All Recipients" },
  { id: "active", label: "Active" },
  { id: "unsubscribed", label: "Unsubscribed" },
  { id: "bounced", label: "Bounced" },
];

export function RecipientsPage() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Recipient Manager" searchPlaceholder="Search recipients, tags, or domains..." />

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            <div className="flex items-center gap-3">
              <Button variant="secondary" icon="upload">
                Import CSV
              </Button>
              <Button variant="primary" icon="verified">
                Validate Emails
              </Button>
              <Button variant="danger" icon="delete">
                Bulk Delete
              </Button>
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-on-surface-variant font-label-sm uppercase tracking-wider">
              <div className="col-span-1 flex items-center">
                <input className="rounded bg-surface-container-highest border-glass-stroke text-primary focus:ring-primary/20" type="checkbox" />
              </div>
              <div className="col-span-3">Recipient Name</div>
              <div className="col-span-3">Email Address</div>
              <div className="col-span-2">Company</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-right">Last Sent</div>
            </div>

            <div className="space-y-3">
              {mockRecipients.map((recipient, i) => (
                <div key={i} className="table-row grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-lowest/40 border border-glass-stroke rounded-2xl items-center">
                  <div className="col-span-1 flex items-center">
                    <input className="rounded bg-surface-container-highest border-glass-stroke text-primary focus:ring-primary/20" type="checkbox" />
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <Avatar name={recipient.name} />
                    <div>
                      <p className="text-on-surface font-semibold text-body-md">{recipient.name}</p>
                      <p className="text-on-surface-variant text-label-sm">{recipient.role}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-on-surface-variant font-label-md">{recipient.email}</div>
                  <div className="col-span-2 text-on-surface-variant font-label-md">{recipient.company}</div>
                  <div className="col-span-1 flex justify-center">
                    <Badge status={recipient.status} />
                  </div>
                  <div className="col-span-2 text-right text-on-surface-variant text-label-md">{recipient.lastSent}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-glass-stroke text-on-surface-variant">
            <p className="text-label-md">
              Showing <span className="text-on-surface font-semibold">1-5</span> of{" "}
              <span className="text-on-surface font-semibold">1,248</span> recipients
            </p>
            <Pagination currentPage={1} totalPages={124} onPageChange={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
