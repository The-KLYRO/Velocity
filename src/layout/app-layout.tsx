import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div className="appFrame" style={{ flex: 1, minHeight: 0 }}>
        <Sidebar />
        <main className="appMain">
          <TopBar />
          <div className="appContent">
            <div className="appContentInner">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
