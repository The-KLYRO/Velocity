import { useState, useEffect } from "react";
import { Button, Input, Select, Toast } from "../components/ui";
import { useSettingsStore } from "../stores/settings-store";
import { useSmtpStore } from "../stores/smtp-store";
import { getSmtpAccountPassword } from "../lib/tauri-api";
import type { SmtpAccount, SmtpEncryption } from "../types";

const encryptionOptions = [
  { value: "tls", label: "TLS/SSL" },
  { value: "starttls", label: "STARTTLS" },
  { value: "none", label: "None" },
];

export function SettingsPage() {
  const {
    delayMs, retryCount, dailyLimit, batchSize,
    notifications, tracking, signature,
    fetchSettings, setDelayMs, setRetryCount, setDailyLimit, setBatchSize,
    toggleNotification, toggleTracking, setSignature, saveAll,
  } = useSettingsStore();

  const {
    accounts, fetchAccounts, addAccount, removeAccount, updateAccount, testConnection,
  } = useSmtpStore();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [localDelay, setLocalDelay] = useState(String(delayMs));
  const [localRetry, setLocalRetry] = useState(String(retryCount));
  const [localLimit, setLocalLimit] = useState(String(dailyLimit));
  const [localBatch, setLocalBatch] = useState(String(batchSize));

  const [newAccount, setNewAccount] = useState({
    email: "",
    password: "",
    host: "",
    port: "587",
    encryption: "starttls" as SmtpEncryption,
    delayMs: "1000",
    retryCount: "3",
    dailyLimit: "500",
  });
  const [testResults, setTestResults] = useState<Record<string, { testing: boolean; result: "success" | "error" | null }>>({});
  const [editingAccounts, setEditingAccounts] = useState<Record<string, Partial<SmtpAccount>>>({});

  useEffect(() => {
    fetchSettings();
    fetchAccounts();
  }, [fetchSettings, fetchAccounts]);

  useEffect(() => {
    setLocalDelay(String(delayMs));
    setLocalRetry(String(retryCount));
    setLocalLimit(String(dailyLimit));
    setLocalBatch(String(batchSize));
  }, [delayMs, retryCount, dailyLimit, batchSize]);

  const showToastMessage = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = async () => {
    setDelayMs(Number(localDelay) || 1000);
    setRetryCount(Number(localRetry) || 3);
    setDailyLimit(Number(localLimit) || 500);
    setBatchSize(Number(localBatch) || 50);
    await saveAll();
    showToastMessage("Settings saved");
  };

  const handleTestConnection = async (account: { id: string; email: string; host: string; port: number }) => {
    setTestResults((prev) => ({ ...prev, [account.id]: { testing: true, result: null } }));
    try {
      const password = await getSmtpAccountPassword(account.id);
      const result = await testConnection(account.email, password, account.host, account.port);
      const success = result.connected;
      setTestResults((prev) => ({ ...prev, [account.id]: { testing: false, result: success ? "success" : "error" } }));
      if (success) await updateAccount(account.id, { isConnected: true });
      showToastMessage(result.message, success ? "success" : "error");
    } catch (e) {
      setTestResults((prev) => ({ ...prev, [account.id]: { testing: false, result: "error" } }));
      showToastMessage(`Could not retrieve password: ${String(e)}`, "error");
    }
  };

  const validateNewAccount = (): string | null => {
    if (!newAccount.email.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAccount.email)) return "Invalid email address format";
    if (!newAccount.password.trim()) return "Password is required";
    if (!newAccount.host.trim()) return "SMTP host is required";
    const port = Number(newAccount.port);
    if (!port || port < 1 || port > 65535) return "Port must be between 1 and 65535";
    const dailyLimit = Number(newAccount.dailyLimit);
    if (isNaN(dailyLimit) || dailyLimit < 0) return "Daily limit must be a positive number";
    const retryCount = Number(newAccount.retryCount);
    if (isNaN(retryCount) || retryCount < 0) return "Retry count must be a positive number";
    const delayMs = Number(newAccount.delayMs);
    if (isNaN(delayMs) || delayMs < 0) return "Delay must be a positive number";
    return null;
  };

  const handleAddAccount = async () => {
    const validationError = validateNewAccount();
    if (validationError) {
      showToastMessage(validationError, "error");
      return;
    }
    const email = newAccount.email.trim();
    const password = newAccount.password;
    const host = newAccount.host.trim();
    const port = Number(newAccount.port) || 587;
    const encryption = newAccount.encryption;
    const dailyLimit = Number(newAccount.dailyLimit) || 500;
    const delayMs = Number(newAccount.delayMs) || 1000;
    const retryCount = Number(newAccount.retryCount) || 3;

    const saved = await addAccount({ email, password, host, port, encryption, dailyLimit, delayMs, retryCount, isConnected: false });
    if (!saved) {
      showToastMessage("Failed to add account. Please check your details.", "error");
      return;
    }
    await fetchAccounts();
    setNewAccount({ email: "", password: "", host: "", port: "587", encryption: "starttls", delayMs: "1000", retryCount: "3", dailyLimit: "500" });
    setTestResults((prev) => ({ ...prev, [saved.id]: { testing: true, result: null } }));

    try {
      const result = await testConnection(email, password, host, port);
      if (result.connected) {
        await updateAccount(saved.id, { isConnected: true });
        await fetchAccounts();
        setTestResults((prev) => ({ ...prev, [saved.id]: { testing: false, result: "success" } }));
        showToastMessage("Account added and connected successfully", "success");
      } else {
        setTestResults((prev) => ({ ...prev, [saved.id]: { testing: false, result: "error" } }));
        showToastMessage("Account saved but connection failed: " + result.message, "error");
      }
    } catch {
      setTestResults((prev) => ({ ...prev, [saved.id]: { testing: false, result: "error" } }));
      showToastMessage("Account saved but connection test failed", "error");
    }
  };

  const handleDeleteAccount = async (id: string) => {
    await removeAccount(id);
    showToastMessage("Account deleted", "info");
  };

  const handleUpdateAccount = async (id: string) => {
    const edits = editingAccounts[id];
    if (!edits) {
      showToastMessage("No changes to save", "info");
      return;
    }
    const account = accounts.find((a) => a.id === id);
    if (!account) return;

    if (edits.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(edits.email)) {
      showToastMessage("Invalid email address format", "error");
      return;
    }
    if (edits.host !== undefined && !edits.host.trim()) {
      showToastMessage("SMTP host cannot be empty", "error");
      return;
    }
    if (edits.port !== undefined && (edits.port < 1 || edits.port > 65535)) {
      showToastMessage("Port must be between 1 and 65535", "error");
      return;
    }

    const updatedEmail = (edits.email as string) ?? account.email;
    const updatedHost = (edits.host as string) ?? account.host;
    const updatedPort = edits.port ?? account.port;

    await updateAccount(id, edits);
    setEditingAccounts((prev) => { const next = { ...prev }; delete next[id]; return next; });

    setTestResults((prev) => ({ ...prev, [id]: { testing: true, result: null } }));

    try {
      const password = await getSmtpAccountPassword(id);
      const result = await testConnection(updatedEmail, password, updatedHost, updatedPort);
      if (result.connected) {
        await updateAccount(id, { isConnected: true });
        await fetchAccounts();
        setTestResults((prev) => ({ ...prev, [id]: { testing: false, result: "success" } }));
        showToastMessage("Account updated and connected successfully", "success");
      } else {
        await updateAccount(id, { isConnected: false });
        await fetchAccounts();
        setTestResults((prev) => ({ ...prev, [id]: { testing: false, result: "error" } }));
        showToastMessage("Account updated but connection failed: " + result.message, "error");
      }
    } catch {
      setTestResults((prev) => ({ ...prev, [id]: { testing: false, result: "error" } }));
      showToastMessage("Account updated but connection test failed", "error");
    }
  };

  const updateEditingField = (id: string, field: string, value: string | number) => {
    setEditingAccounts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  return (
    <div>
      <div style={{ maxWidth: 768, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div className="h2">Application Settings</div>
          <div style={{ fontSize: 12, color: "var(--text2)" }}>Configure your sending preferences</div>
        </div>

        {/* SMTP Accounts */}
        <div className="card card--pad" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>SMTP Accounts</div>

          {accounts.map((account) => {
            const test = testResults[account.id];
            return (
              <div key={account.id} style={{ marginBottom: 16, padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{account.email}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: account.isConnected ? "var(--good)" : "var(--bad)" }} />
                    <span style={{ color: account.isConnected ? "var(--good)" : "var(--bad)" }}>
                      {account.isConnected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Input
                    label="Email Address"
                    type="email"
                    value={editingAccounts[account.id]?.email ?? account.email}
                    onChange={(e) => updateEditingField(account.id, "email", e.target.value)}
                  />
                  <Input
                    label="SMTP Host"
                    value={editingAccounts[account.id]?.host ?? account.host}
                    onChange={(e) => updateEditingField(account.id, "host", e.target.value)}
                  />
                  <Input
                    label="Port"
                    type="number"
                    value={String(editingAccounts[account.id]?.port ?? account.port)}
                    onChange={(e) => updateEditingField(account.id, "port", Number(e.target.value))}
                  />
                  <Select
                    label="Encryption"
                    value={editingAccounts[account.id]?.encryption ?? account.encryption}
                    onChange={(val) => updateEditingField(account.id, "encryption", val)}
                    options={encryptionOptions}
                  />
                  <Input
                    label="Delay Between Emails (ms)"
                    type="number"
                    value={String(editingAccounts[account.id]?.delayMs ?? account.delayMs)}
                    onChange={(e) => updateEditingField(account.id, "delayMs", Number(e.target.value))}
                  />
                  <Input
                    label="Retry Count"
                    type="number"
                    value={String(editingAccounts[account.id]?.retryCount ?? account.retryCount)}
                    onChange={(e) => updateEditingField(account.id, "retryCount", Number(e.target.value))}
                  />
                  <Input
                    label="Daily Send Limit"
                    type="number"
                    value={String(editingAccounts[account.id]?.dailyLimit ?? account.dailyLimit)}
                    onChange={(e) => updateEditingField(account.id, "dailyLimit", Number(e.target.value))}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--stroke0)" }}>
                  <Button variant="secondary" icon="wifi_find" onClick={() => handleTestConnection(account)} disabled={test?.testing}>
                    {test?.testing ? "Testing..." : "Test Connection"}
                  </Button>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="danger" onClick={() => handleDeleteAccount(account.id)}>Delete</Button>
                    <Button onClick={() => handleUpdateAccount(account.id)}>Save Changes</Button>
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>Add New Account</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input
                label="Email Address"
                type="email"
                placeholder="your-email@company.com"
                value={newAccount.email}
                onChange={(e) => setNewAccount((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                label="App Password"
                type="password"
                placeholder="xxxx xxxx xxxx xxxx"
                value={newAccount.password}
                onChange={(e) => setNewAccount((prev) => ({ ...prev, password: e.target.value }))}
              />
              <Input
                label="SMTP Host"
                placeholder="smtp.company.com"
                value={newAccount.host}
                onChange={(e) => setNewAccount((prev) => ({ ...prev, host: e.target.value }))}
              />
              <Input
                label="Port"
                type="number"
                placeholder="465"
                value={newAccount.port}
                onChange={(e) => setNewAccount((prev) => ({ ...prev, port: e.target.value }))}
              />
              <Select
                label="Encryption"
                value={newAccount.encryption}
                onChange={(val) => setNewAccount((prev) => ({ ...prev, encryption: val as SmtpEncryption }))}
                options={encryptionOptions}
              />
              <Input
                label="Delay Between Emails (ms)"
                type="number"
                value={newAccount.delayMs}
                onChange={(e) => setNewAccount((prev) => ({ ...prev, delayMs: e.target.value }))}
              />
              <Input
                label="Retry Count"
                type="number"
                value={newAccount.retryCount}
                onChange={(e) => setNewAccount((prev) => ({ ...prev, retryCount: e.target.value }))}
              />
              <Input
                label="Daily Send Limit"
                type="number"
                value={newAccount.dailyLimit}
                onChange={(e) => setNewAccount((prev) => ({ ...prev, dailyLimit: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Button onClick={handleAddAccount} disabled={!newAccount.email || !newAccount.host}>
                Add Account
              </Button>
            </div>
          </div>
        </div>

        {/* Sending Defaults */}
        <div className="card card--pad" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Sending Defaults</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Delay Between Emails (ms)</label>
              <input type="number" value={localDelay} onChange={(e) => setLocalDelay(e.target.value)}
                style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Retry Count</label>
              <input type="number" value={localRetry} onChange={(e) => setLocalRetry(e.target.value)}
                style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Daily Send Limit</label>
              <input type="number" value={localLimit} onChange={(e) => setLocalLimit(e.target.value)}
                style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Batch Size</label>
              <input type="number" value={localBatch} onChange={(e) => setLocalBatch(e.target.value)}
                style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card card--pad" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Notifications</div>
          <div style={{ display: "grid", gap: 10 }}>
            {([
              { key: "campaignCompleted" as const, label: "Campaign Completed", description: "Get notified when a campaign finishes sending" },
              { key: "bounceAlerts" as const, label: "Bounce Alerts", description: "Receive alerts for bounced emails" },
              { key: "dailySummary" as const, label: "Daily Summary", description: "Get a daily summary of sending activity" },
            ]).map((item) => (
              <div key={item.key} className="txRow">
                <div className="who">
                  <div className="whoMeta">
                    <div className="whoName">{item.label}</div>
                    <div className="whoHandle">{item.description}</div>
                  </div>
                </div>
                <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={() => toggleNotification(item.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full bg-[var(--panel2)] peer-checked:bg-[var(--good)] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Email Signature */}
        <div className="card card--pad" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Email Signature</div>
          <textarea
            style={{ width: "100%", padding: 14, borderRadius: 12, background: "rgba(0,0,0,0.2)", minHeight: 150, color: "var(--text0)", outline: "none", border: "1px solid var(--stroke0)", resize: "none", fontFamily: "inherit", fontSize: 14 }}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
          />
        </div>

        {/* Tracking */}
        <div className="card card--pad" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Tracking</div>
          <div style={{ display: "grid", gap: 10 }}>
            {([
              { key: "openTracking" as const, label: "Open Tracking", description: "Track when recipients open your emails" },
              { key: "clickTracking" as const, label: "Click Tracking", description: "Track link clicks in your emails" },
            ]).map((item) => (
              <div key={item.key} className="txRow">
                <div className="who">
                  <div className="whoMeta">
                    <div className="whoName">{item.label}</div>
                    <div className="whoHandle">{item.description}</div>
                  </div>
                </div>
                <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={tracking[item.key]}
                    onChange={() => toggleTracking(item.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full bg-[var(--panel2)] peer-checked:bg-[var(--good)] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="secondary">Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
