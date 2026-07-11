import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { AppLayout } from "../layout/app-layout";
import { DashboardPage } from "../pages/dashboard";
import { ComposePage } from "../pages/compose";
import { RecipientsPage } from "../pages/recipients";
import { CampaignsPage } from "../pages/campaigns";
import { SettingsPage } from "../pages/settings";
import { SmtpPage } from "../pages/smtp";
import { NavProvider } from "./page-transition";

const pageOrder = ["/", "/compose", "/recipients", "/campaigns", "/smtp", "/settings"];

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [animClass, setAnimClass] = useState("");
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current === location.pathname) return;

    const prevIndex = pageOrder.indexOf(prevPath.current);
    const currIndex = pageOrder.indexOf(location.pathname);
    const goingDown = currIndex > prevIndex;

    setAnimClass("");
    void document.body.offsetHeight;
    setAnimClass(goingDown ? "slide-from-down" : "slide-from-up");

    prevPath.current = location.pathname;
  }, [location.pathname]);

  return <div key={location.pathname} className={animClass}>{children}</div>;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <NavProvider>
        <AppLayout>
          <PageTransition>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/compose" element={<ComposePage />} />
              <Route path="/recipients" element={<RecipientsPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/smtp" element={<SmtpPage />} />
            </Routes>
          </PageTransition>
        </AppLayout>
      </NavProvider>
    </BrowserRouter>
  );
}
