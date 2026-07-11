import { useEffect } from "react";
import { Button, Badge } from "../components/ui";
import { useRecipientStore } from "../stores/recipient-store";

const tabs = [
  { id: "all", label: "All Recipients" },
  { id: "active", label: "Active" },
  { id: "unsubscribed", label: "Unsubscribed" },
  { id: "bounced", label: "Bounced" },
];

export function RecipientsPage() {
  const recipients = useRecipientStore((s) => s.recipients);
  const total = useRecipientStore((s) => s.total);
  const selectedIds = useRecipientStore((s) => s.selectedIds);
  const filter = useRecipientStore((s) => s.filter);
  const isLoading = useRecipientStore((s) => s.isLoading);
  const fetchRecipients = useRecipientStore((s) => s.fetchRecipients);
  const fetchSearchResults = useRecipientStore((s) => s.fetchSearchResults);
  const setFilter = useRecipientStore((s) => s.setFilter);
  const toggleSelection = useRecipientStore((s) => s.toggleSelection);
  const removeRecipients = useRecipientStore((s) => s.removeRecipients);
  const setSearchQuery = useRecipientStore((s) => s.setSearchQuery);
  const importCsv = useRecipientStore((s) => s.importCsv);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  const handleTabChange = (tab: string) => {
    setFilter(tab as "all" | "active" | "bounced" | "unsubscribed");
  };

  const handleBulkDelete = async () => {
    await removeRecipients(Array.from(selectedIds));
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await importCsv(file.name);
      }
    };
    input.click();
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      fetchSearchResults(value);
    } else {
      fetchRecipients();
    }
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
                borderColor: filter === tab.id ? "var(--stroke1)" : "transparent",
                color: filter === tab.id ? "var(--text0)" : "var(--text2)",
              }}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" icon="upload" onClick={handleImport}>
            Import CSV
          </Button>
          <Button variant="danger" icon="delete" onClick={handleBulkDelete} disabled={selectedIds.size === 0}>
            Bulk Delete ({selectedIds.size})
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text2)" }}>Loading recipients...</div>
      ) : (
        <div style={{ width: "100%" }}>
          <div className="historyHeader">
            <div></div>
            <div>Recipient Name</div>
            <div>Email Address</div>
            <div>Company</div>
            <div>Status</div>
          </div>

          <div>
            {recipients.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text2)" }}>
                No recipients found. Import a CSV or add recipients manually.
              </div>
            ) : recipients.map((recipient) => (
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
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--stroke0)", marginTop: 14 }}>
        <div style={{ fontSize: 12, color: "var(--text2)" }}>
          Showing <span style={{ color: "var(--text0)" }}>{recipients.length}</span> of{" "}
          <span style={{ color: "var(--text0)" }}>{total}</span> recipients
        </div>
      </div>
    </div>
  );
}
