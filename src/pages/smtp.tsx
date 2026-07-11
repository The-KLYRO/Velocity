import { useState } from "react";
import { TopBar } from "../layout/topbar";
import { GlassCard, Input, Button, Toast } from "../components/ui";
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
    <div className="flex flex-col h-full">
      <TopBar title="SMTP Accounts" />

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">SMTP Configuration</h3>
              <p className="text-label-md text-on-surface-variant">Configure your email sending servers</p>
            </div>
          </div>

          {accounts.map((account) => {
            const test = testResults[account.id];
            return (
              <GlassCard key={account.id}>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-headline-md text-on-surface">{account.email}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${account.isConnected ? "bg-green-500" : "bg-error"}`} />
                    <span className={`text-label-sm ${account.isConnected ? "text-green-400" : "text-error"}`}>
                      {account.isConnected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Email Address" type="email" defaultValue={account.email} />
                  <Input label="Password" type="password" defaultValue="••••••••" />
                  <Input label="SMTP Host" defaultValue={account.host} />
                  <Input label="Port" type="number" defaultValue={String(account.port)} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Encryption</label>
                    <select
                      defaultValue={account.encryption}
                      className="w-full bg-surface-container-high/50 border border-glass-stroke rounded-xl px-4 py-2.5 text-label-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
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

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-glass-stroke">
                  <Button
                    variant="secondary"
                    icon="wifi_find"
                    onClick={() => handleTestConnection(account)}
                    disabled={test?.testing}
                  >
                    {test?.testing ? "Testing..." : "Test Connection"}
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="danger" onClick={() => handleDeleteAccount(account.id)}>Delete</Button>
                    <Button onClick={() => {
                      setToastMessage("Changes saved");
                      setToastType("success");
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                    }}>Save Changes</Button>
                  </div>
                </div>
              </GlassCard>
            );
          })}

          <GlassCard>
            <h4 className="font-headline-md text-on-surface mb-6">Add New Account</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Encryption</label>
                <select
                  value={newAccount.encryption}
                  onChange={(e) => setNewAccount((prev) => ({ ...prev, encryption: e.target.value as SmtpEncryption }))}
                  className="w-full bg-surface-container-high/50 border border-glass-stroke rounded-xl px-4 py-2.5 text-label-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
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

            <div className="flex justify-end mt-8 pt-6 border-t border-glass-stroke">
              <Button onClick={handleAddAccount} disabled={!newAccount.email || !newAccount.host}>
                Add Account
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
