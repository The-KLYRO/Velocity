import { useMemo, useState } from "react";
import { Button, Badge } from "../components/ui";
import { useRecipientStore } from "../stores/recipient-store";

const tabs = [
  { id: "all", label: "All Recipients" },
  { id: "active", label: "Active" },
  { id: "unsubscribed", label: "Unsubscribed" },
  { id: "bounced", label: "Bounced" },
];

export function RecipientsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const recipients = useRecipientStore((s) => s.recipients);
  const selectedIds = useRecipientStore((s) => s.selectedIds);
  const searchQuery = useRecipientStore((s) => s.searchQuery);
  const setFilter = useRecipientStore((s) => s.setFilter);
  const toggleSelection = useRecipientStore((s) => s.toggleSelection);
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

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`pillBtn`}
              style={{
                borderColor: activeTab === tab.id ? "var(--stroke1)" : "transparent",
                color: activeTab === tab.id ? "var(--text0)" : "var(--text2)",
              }}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" icon="upload">
            Import CSV
          </Button>
          <Button variant="primary" icon="verified">
            Validate
          </Button>
          <Button variant="danger" icon="delete" onClick={handleBulkDelete}>
            Bulk Delete
          </Button>
        </div>
      </div>

      <div style={{ width: "100%" }}>
        <div className="historyHeader">
          <div></div>
          <div>Recipient Name</div>
          <div>Email Address</div>
          <div>Company</div>
          <div>Status</div>
        </div>

        <div>
          {filteredRecipients.map((recipient) => (
            <div className="historyRow" key={recipient.id}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(recipient.id)}
                  onChange={() => toggleSelection(recipient.id)}
                  style={{ accentColor: "var(--text0)" }}
                />
              </div>
              <div className="cellMain">{recipient.name}</div>
              <div className="cellSub" style={{ fontSize: 12 }}>{recipient.email}</div>
              <div className="cellSub" style={{ fontSize: 12 }}>{recipient.company}</div>
              <div>
                <Badge status={recipient.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--stroke0)", marginTop: 14 }}>
        <div style={{ fontSize: 12, color: "var(--text2)" }}>
          Showing <span style={{ color: "var(--text0)" }}>1-{filteredRecipients.length}</span> of{" "}
          <span style={{ color: "var(--text0)" }}>{recipients.length}</span> recipients
        </div>
      </div>
    </div>
  );
}
