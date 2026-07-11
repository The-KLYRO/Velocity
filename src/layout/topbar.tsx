import { useLocation } from "react-router-dom";
import { getCurrentWindow } from "@tauri-apps/api/window";

const titleByPath: Record<string, string> = {
  "/": "Dashboard",
  "/compose": "Compose",
  "/recipients": "Recipients",
  "/campaigns": "Campaigns",
  "/smtp": "SMTP Accounts",
  "/settings": "Settings",
  "/templates": "Templates",
  "/reports": "Reports",
};

export function TopBar() {
  const location = useLocation();
  const title = titleByPath[location.pathname] || "Dashboard";

  const handleMinimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try { await getCurrentWindow().minimize(); } catch (err) { console.error("minimize failed", err); }
  };
  const handleMaximize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try { await getCurrentWindow().toggleMaximize(); } catch (err) { console.error("maximize failed", err); }
  };
  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try { await getCurrentWindow().close(); } catch (err) { console.error("close failed", err); }
  };

  return (
    <header
      data-tauri-drag-region
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 14px 10px 18px",
        userSelect: "none",
      } as React.CSSProperties}
    >
      <div data-tauri-drag-region style={{ fontSize: 13, letterSpacing: "0.2px", color: "var(--text1)" }}>{title}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button data-tauri-drag-region="false" className="pillBtn" type="button" aria-label="Search">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>search</span>
        </button>
        <button data-tauri-drag-region="false" className="pillBtn" type="button" aria-label="Notifications">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>notifications</span>
        </button>
        <div data-tauri-drag-region="false" style={{ width: 1, height: 18, background: "var(--stroke0)", margin: "0 4px" }} />
        <button
          data-tauri-drag-region="false"
          onClick={handleMinimize}
          style={{
            width: 36, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", background: "transparent", color: "var(--text2)", borderRadius: 6, cursor: "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--text0)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text2)"; }}
          aria-label="Minimize"
        >
          <svg width="10" height="1.5" viewBox="0 0 10 1.5" fill="currentColor"><rect width="10" height="1.5" rx="0.75" /></svg>
        </button>
        <button
          data-tauri-drag-region="false"
          onClick={handleMaximize}
          style={{
            width: 36, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", background: "transparent", color: "var(--text2)", borderRadius: 6, cursor: "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--text0)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text2)"; }}
          aria-label="Maximize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="0.7" y="0.7" width="8.6" height="8.6" rx="1.5" /></svg>
        </button>
        <button
          data-tauri-drag-region="false"
          onClick={handleClose}
          style={{
            width: 36, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", background: "transparent", color: "var(--text2)", borderRadius: 6, cursor: "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,71,71,0.4)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text2)"; }}
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><line x1="1.5" y1="1.5" x2="8.5" y2="8.5" /><line x1="8.5" y1="1.5" x2="1.5" y2="8.5" /></svg>
        </button>
      </div>
    </header>
  );
}
