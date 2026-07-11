import { useMemo, useState } from "react";
import { TopBar } from "../layout/topbar";
import { Button, Tabs, Badge, Pagination, Avatar } from "../components/ui";
import { useRecipientStore } from "../stores/recipient-store";

const tabs = [
  { id: "all", label: "All Recipients" },
  { id: "active", label: "Active" },
  { id: "unsubscribed", label: "Unsubscribed" },
  { id: "bounced", label: "Bounced" },
];

function formatDate(d: Date | undefined): string {
  if (!d) return "Never";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function RecipientsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const recipients = useRecipientStore((s) => s.recipients);
  const selectedIds = useRecipientStore((s) => s.selectedIds);
  const searchQuery = useRecipientStore((s) => s.searchQuery);
  const setFilter = useRecipientStore((s) => s.setFilter);
  const setSearchQuery = useRecipientStore((s) => s.setSearchQuery);
  const toggleSelection = useRecipientStore((s) => s.toggleSelection);
  const selectAll = useRecipientStore((s) => s.selectAll);
  const removeRecipients = useRecipientStore((s) => s.removeRecipients);
  const clearSelection = useRecipientStore((s) => s.clearSelection);

  const filteredRecipients = useMemo(() => {
    let result = recipients;

    if (activeTab !== "all") {
      result = result.filter((r) => r.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [recipients, activeTab, searchQuery]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFilter(tab as "all" | "active" | "bounced" | "unsubscribed");
  };

  const handleBulkDelete = () => {
    removeRecipients(Array.from(selectedIds));
    clearSelection();
  };

  const allSelected =
    filteredRecipients.length > 0 &&
    filteredRecipients.every((r) => selectedIds.has(r.id));

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(filteredRecipients.map((r) => r.id));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Recipient Manager" searchPlaceholder="Search recipients, tags, or domains..." onSearch={setSearchQuery} />

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
            <div className="flex items-center gap-3">
              <Button variant="secondary" icon="upload">
                Import CSV
              </Button>
              <Button variant="primary" icon="verified">
                Validate Emails
              </Button>
              <Button variant="danger" icon="delete" onClick={handleBulkDelete}>
                Bulk Delete
              </Button>
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-on-surface-variant font-label-sm uppercase tracking-wider">
              <div className="col-span-1 flex items-center">
                <input
                  className="rounded bg-surface-container-highest border-glass-stroke text-primary focus:ring-primary/20"
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </div>
              <div className="col-span-3">Recipient Name</div>
              <div className="col-span-3">Email Address</div>
              <div className="col-span-2">Company</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-right">Last Sent</div>
            </div>

            <div className="space-y-3">
              {filteredRecipients.map((recipient) => (
                <div key={recipient.id} className="table-row grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-lowest/40 border border-glass-stroke rounded-2xl items-center">
                  <div className="col-span-1 flex items-center">
                    <input
                      className="rounded bg-surface-container-highest border-glass-stroke text-primary focus:ring-primary/20"
                      type="checkbox"
                      checked={selectedIds.has(recipient.id)}
                      onChange={() => toggleSelection(recipient.id)}
                    />
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <Avatar name={recipient.name} />
                    <div>
                      <p className="text-on-surface font-semibold text-body-md">{recipient.name}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-on-surface-variant font-label-md">{recipient.email}</div>
                  <div className="col-span-2 text-on-surface-variant font-label-md">{recipient.company}</div>
                  <div className="col-span-1 flex justify-center">
                    <Badge status={recipient.status} />
                  </div>
                  <div className="col-span-2 text-right text-on-surface-variant text-label-md">{formatDate(recipient.lastSent)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-glass-stroke text-on-surface-variant">
            <p className="text-label-md">
              Showing <span className="text-on-surface font-semibold">1-{filteredRecipients.length}</span> of{" "}
              <span className="text-on-surface font-semibold">{recipients.length}</span> recipients
            </p>
            <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
