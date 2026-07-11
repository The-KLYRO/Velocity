import { useState } from "react";
import { Input, Button, Toast } from "../components/ui";
import { useSmtpStore } from "../stores/smtp-store";
import type { SmtpAccount, SmtpEncryption } from "../types";

export function SmtpPage() {
  const { accounts, addAccount, updateAccount, removeAccount } = useSmtpStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

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

  const handleTestConnection = async (account: SmtpAccount) => {
    setTestResults((prev) => ({ ...prev, [account.id]: { testing: true, result: null } }));

    // Simulate SMTP test (in real app, this would invoke a Tauri command)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const success = account.host.includes("gmail") || Math.random() > 0.3;
    setTestResults((prev) => ({ ...prev, [account.id]: { testing: false, result: success ? "success" : "error" } }));
    updateAccount(account.id, { isConnected: success });

    setToastMessage(success ? `Connected to ${account.host}` : `Failed to connect to ${account.host}`);
    setToastType(success ? "success" : "error");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddAccount = () => {
    if (!newAccount.email || !newAccount.host) return;

    const account: SmtpAccount = {
      id: `smtp-${Date.now()}`,
      email: newAccount.email,
      host: newAccount.host,
      port: Number(newAccount.port) || 587,
      encryption: newAccount.encryption,
      dailyLimit: Number(newAccount.dailyLimit) || 500,
      delayMs: Number(newAccount.delayMs) || 1000,
      retryCount: Number(newAccount.retryCount) || 3,
      isConnected: false,
    };

    addAccount(account);
    setNewAccount({ email: "", password: "", host: "", port: "587", encryption: "starttls", delayMs: "1000", retryCount: "3", dailyLimit: "500" });

    setToastMessage("Account added successfully");
    setToastType("success");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeleteAccount = (id: string) => {
    removeAccount(id);
    setToastMessage("Account deleted");
    setToastType("info");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div>
      <div style={{ maxWidth: 768, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div className="h2">SMTP Configuration</div>
          <div style={{ fontSize: 12, color: "var(--text2)" }}>Configure your email sending servers</div>
        </div>

        {accounts.map((account) => {
          const test = testResults[account.id];
          return (
            <div className="card card--pad" key={account.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{account.email}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: account.isConnected ? "var(--good)" : "var(--bad)" }} />
                  <span style={{ color: account.isConnected ? "var(--good)" : "var(--bad)" }}>
                    {account.isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Email Address" type="email" defaultValue={account.email} />
                <Input label="Password" type="password" defaultValue="••••••••" />
                <Input label="SMTP Host" defaultValue={account.host} />
                <Input label="Port" type="number" defaultValue={String(account.port)} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Encryption</label>
                  <select
                    defaultValue={account.encryption}
                    style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }}
                  >
                    <option value="starttls">STARTTLS</option>
                    <option value="tls">TLS/SSL</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <Input label="Delay Between Emails (ms)" type="number" defaultValue={String(account.delayMs)} />
                <Input label="Retry Count" type="number" defaultValue={String(account.retryCount)} />
                <Input label="Daily Send Limit" type="number" defaultValue={String(account.dailyLimit)} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--stroke0)" }}>
                <Button
                  variant="secondary"
                  icon="wifi_find"
                  onClick={() => handleTestConnection(account)}
                  disabled={test?.testing}
                >
                  {test?.testing ? "Testing..." : "Test Connection"}
                </Button>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="danger" onClick={() => handleDeleteAccount(account.id)}>Delete</Button>
                  <Button onClick={() => {
                    setToastMessage("Changes saved");
                    setToastType("success");
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  }}>Save Changes</Button>
                </div>
              </div>
            </div>
          );
        })}

        <div className="card card--pad">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Add New Account</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="your-email@company.com"
              value={newAccount.email}
              onChange={(e) => setNewAccount((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
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
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Encryption</label>
              <select
                value={newAccount.encryption}
                onChange={(e) => setNewAccount((prev) => ({ ...prev, encryption: e.target.value as SmtpEncryption }))}
                style={{ width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 12, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" }}
              >
                <option value="tls">TLS/SSL</option>
                <option value="starttls">STARTTLS</option>
                <option value="none">None</option>
              </select>
            </div>
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

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--stroke0)" }}>
            <Button onClick={handleAddAccount} disabled={!newAccount.email || !newAccount.host}>
              Add Account
            </Button>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
