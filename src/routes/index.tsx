import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "../layout/app-layout";
import { DashboardPage } from "../pages/dashboard";
import { ComposePage } from "../pages/compose";
import { RecipientsPage } from "../pages/recipients";
import { CampaignsPage } from "../pages/campaigns";
import { TemplatesPage } from "../pages/templates";
import { ReportsPage } from "../pages/reports";
import { SettingsPage } from "../pages/settings";
import { SmtpPage } from "../pages/smtp";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/compose" element={<ComposePage />} />
          <Route path="/recipients" element={<RecipientsPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/smtp" element={<SmtpPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
