import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md overflow-hidden">
      <Sidebar />
      <main className="ml-[280px] min-h-screen relative flex flex-col">
        {children}
      </main>
    </div>
  );
}
