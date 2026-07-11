import { invoke } from "@tauri-apps/api/core";
import type {
  Campaign,
  CampaignStatus,
  Recipient,
  RecipientStatus,
  Template,
  SmtpAccount,
  SmtpEncryption,
  LogEntry,
} from "../types";

// ─── Campaign Commands ───────────────────────────────────────────

interface CampaignBackend {
  id: string;
  name: string;
  status: string;
  template_id: string | null;
  created_at: string;
  sent_count: number;
  total_count: number;
}

function mapCampaign(c: CampaignBackend): Campaign {
  return {
    id: c.id,
    name: c.name,
    status: c.status as CampaignStatus,
    templateId: c.template_id ?? undefined,
    createdAt: new Date(c.created_at),
    sentCount: c.sent_count,
    totalCount: c.total_count,
  };
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  const data = await invoke<CampaignBackend[]>("get_campaigns");
  return data.map(mapCampaign);
}

export async function createCampaign(
  name: string,
  templateId?: string,
  totalCount?: number
): Promise<Campaign> {
  const data = await invoke<CampaignBackend>("create_campaign", {
    name,
    templateId: templateId ?? null,
    totalCount: totalCount ?? 0,
  });
  return mapCampaign(data);
}

export async function startCampaign(id: string): Promise<void> {
  await invoke("start_campaign", { id });
}

export async function pauseCampaign(id: string): Promise<void> {
  await invoke("pause_campaign", { id });
}

export async function resumeCampaign(id: string): Promise<void> {
  await invoke("resume_campaign", { id });
}

export async function deleteCampaign(id: string): Promise<void> {
  await invoke("delete_campaign", { id });
}

// ─── Recipient Commands ──────────────────────────────────────────

interface RecipientBackend {
  id: string;
  email: string;
  name: string;
  company: string | null;
  status: string;
  tags: string[];
  created_at: string;
  last_sent: string | null;
}

function mapRecipient(r: RecipientBackend): Recipient {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    company: r.company ?? undefined,
    status: r.status as RecipientStatus,
    tags: r.tags,
    createdAt: new Date(r.created_at),
    lastSent: r.last_sent ? new Date(r.last_sent) : undefined,
  };
}

export async function fetchRecipients(
  filter?: string,
  page?: number,
  perPage?: number
): Promise<{ recipients: Recipient[]; total: number }> {
  const [data, total] = await invoke<[RecipientBackend[], number]>(
    "get_recipients",
    {
      filter: filter ?? null,
      page: page ?? null,
      perPage: perPage ?? null,
    }
  );
  return { recipients: data.map(mapRecipient), total };
}

export async function searchRecipients(
  query: string,
  page?: number,
  perPage?: number
): Promise<{ recipients: Recipient[]; total: number }> {
  const [data, total] = await invoke<[RecipientBackend[], number]>(
    "search_recipients",
    {
      query,
      page: page ?? null,
      perPage: perPage ?? null,
    }
  );
  return { recipients: data.map(mapRecipient), total };
}

export async function addRecipient(
  email: string,
  name: string,
  company?: string
): Promise<Recipient> {
  const data = await invoke<RecipientBackend>("add_recipient", {
    email,
    name,
    company: company ?? null,
  });
  return mapRecipient(data);
}

export async function deleteRecipients(ids: string[]): Promise<void> {
  await invoke("delete_recipients", { ids });
}

export async function importRecipientsCsv(
  filePath: string
): Promise<Recipient[]> {
  const data = await invoke<RecipientBackend[]>("import_recipients_csv", {
    filePath,
  });
  return data.map(mapRecipient);
}

// ─── Template Commands ───────────────────────────────────────────

interface TemplateBackend {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  variables: string[];
  created_at: string;
}

function mapTemplate(t: TemplateBackend): Template {
  return {
    id: t.id,
    name: t.name,
    subject: t.subject,
    bodyHtml: t.body_html,
    bodyText: t.body_text ?? undefined,
    variables: t.variables,
    createdAt: new Date(t.created_at),
  };
}

export async function fetchTemplates(): Promise<Template[]> {
  const data = await invoke<TemplateBackend[]>("get_templates");
  return data.map(mapTemplate);
}

export async function createTemplate(
  name: string,
  subject: string,
  bodyHtml: string,
  bodyText?: string,
  variables?: string[]
): Promise<Template> {
  const data = await invoke<TemplateBackend>("create_template", {
    name,
    subject,
    bodyHtml,
    bodyText: bodyText ?? null,
    variables: variables ?? [],
  });
  return mapTemplate(data);
}

export async function updateTemplate(
  id: string,
  updates: {
    name?: string;
    subject?: string;
    bodyHtml?: string;
    bodyText?: string;
    variables?: string[];
  }
): Promise<Template> {
  const data = await invoke<TemplateBackend>("update_template", {
    id,
    name: updates.name ?? null,
    subject: updates.subject ?? null,
    bodyHtml: updates.bodyHtml ?? null,
    bodyText: updates.bodyText ?? null,
    variables: updates.variables ?? null,
  });
  return mapTemplate(data);
}

export async function deleteTemplate(id: string): Promise<void> {
  await invoke("delete_template", { id });
}

// ─── SMTP Commands ───────────────────────────────────────────────

interface SmtpAccountBackend {
  id: string;
  email: string;
  host: string;
  port: number;
  encryption: string;
  daily_limit: number;
  delay_ms: number;
  retry_count: number;
  is_connected: boolean;
}

function mapSmtpAccount(a: SmtpAccountBackend): SmtpAccount {
  return {
    id: a.id,
    email: a.email,
    host: a.host,
    port: a.port,
    encryption: a.encryption as SmtpEncryption,
    dailyLimit: a.daily_limit,
    delayMs: a.delay_ms,
    retryCount: a.retry_count,
    isConnected: a.is_connected,
  };
}

export async function fetchSmtpAccounts(): Promise<SmtpAccount[]> {
  const data = await invoke<SmtpAccountBackend[]>("get_smtp_accounts");
  return data.map(mapSmtpAccount);
}

export async function saveSmtpAccount(
  account: Partial<SmtpAccount> & { email: string; host: string }
): Promise<SmtpAccount> {
  const data = await invoke<SmtpAccountBackend>("save_smtp_account", {
    id: account.id ?? null,
    email: account.email,
    host: account.host,
    port: account.port ?? 587,
    encryption: account.encryption ?? "starttls",
    dailyLimit: account.dailyLimit ?? 500,
    delayMs: account.delayMs ?? 1000,
    retryCount: account.retryCount ?? 3,
  });
  return mapSmtpAccount(data);
}

export async function deleteSmtpAccount(id: string): Promise<void> {
  await invoke("delete_smtp_account", { id });
}

export async function updateSmtpConnectionStatus(
  id: string,
  isConnected: boolean
): Promise<void> {
  await invoke("update_smtp_connection_status", { id, isConnected });
}

export async function testSmtpConnection(
  email: string,
  password: string,
  host: string,
  port: number
): Promise<{ connected: boolean; message: string }> {
  return invoke<{ connected: boolean; message: string }>(
    "test_smtp_connection",
    { email, password, host, port }
  );
}

// ─── Reports Commands ────────────────────────────────────────────

interface LogBackend {
  id: string;
  campaign_id: string;
  recipient_id: string;
  event: string;
  status: string;
  timestamp: string;
  details: string | null;
}

interface LogWithInfoBackend {
  id: string;
  campaign_id: string;
  campaign_name: string;
  recipient_email: string;
  event: string;
  status: string;
  timestamp: string;
  details: string | null;
}

export interface LogWithInfo {
  id: string;
  campaignId: string;
  campaignName: string;
  recipientEmail: string;
  event: string;
  status: string;
  timestamp: Date;
  details?: string;
}

export interface DashboardStats {
  totalSent: number;
  totalRecipients: number;
  activeCampaigns: number;
  completedCampaigns: number;
  deliveryRate: number;
}

export async function fetchCampaignLogs(
  campaignId?: string
): Promise<LogEntry[]> {
  const data = await invoke<LogBackend[]>("get_campaign_logs", {
    campaignId: campaignId ?? null,
  });
  return data.map((l) => ({
    id: l.id,
    campaignId: l.campaign_id,
    recipientId: l.recipient_id,
    event: l.event as LogEntry["event"],
    status: l.status as LogEntry["status"],
    timestamp: new Date(l.timestamp),
    details: l.details ?? undefined,
  }));
}

export async function fetchCampaignLogsWithInfo(
  campaignId?: string,
  limit?: number
): Promise<LogWithInfo[]> {
  const data = await invoke<LogWithInfoBackend[]>(
    "get_campaign_logs_with_info",
    {
      campaignId: campaignId ?? null,
      limit: limit ?? null,
    }
  );
  return data.map((l) => ({
    id: l.id,
    campaignId: l.campaign_id,
    campaignName: l.campaign_name,
    recipientEmail: l.recipient_email,
    event: l.event,
    status: l.status,
    timestamp: new Date(l.timestamp),
    details: l.details ?? undefined,
  }));
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const data = await invoke<{
    total_sent: number;
    total_recipients: number;
    active_campaigns: number;
    completed_campaigns: number;
    delivery_rate: number;
  }>("get_dashboard_stats");
  return {
    totalSent: data.total_sent,
    totalRecipients: data.total_recipients,
    activeCampaigns: data.active_campaigns,
    completedCampaigns: data.completed_campaigns,
    deliveryRate: data.delivery_rate,
  };
}

export async function exportLogsCsv(campaignId?: string): Promise<string> {
  return invoke<string>("export_logs_csv", { campaignId: campaignId ?? null });
}

// ─── Settings Commands ───────────────────────────────────────────

interface SettingBackend {
  id: string;
  key: string;
  value: string;
}

export async function fetchAllSettings(): Promise<Record<string, string>> {
  const data = await invoke<SettingBackend[]>("get_all_settings");
  const result: Record<string, string> = {};
  for (const s of data) {
    result[s.key] = s.value;
  }
  return result;
}

export async function fetchSetting(key: string): Promise<string | null> {
  return invoke<string | null>("get_setting", { key });
}

export async function saveSetting(
  key: string,
  value: string
): Promise<void> {
  await invoke("upsert_setting", { key, value });
}

export async function saveSettingsBatch(
  settings: [string, string][]
): Promise<void> {
  await invoke("upsert_settings_batch", { settings });
}

// ─── Recipient List Commands ─────────────────────────────────────

export interface RecipientList {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  memberCount: number;
}

export interface ListMember {
  recipientId: string;
  email: string;
  name: string;
  company: string | null;
  addedAt: Date;
}

interface RecipientListBackend {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count: number;
}

interface ListMemberBackend {
  recipient_id: string;
  email: string;
  name: string;
  company: string | null;
  added_at: string;
}

function mapList(l: RecipientListBackend): RecipientList {
  return {
    id: l.id,
    name: l.name,
    description: l.description,
    createdAt: new Date(l.created_at),
    memberCount: l.member_count,
  };
}

export async function fetchRecipientLists(): Promise<RecipientList[]> {
  const data = await invoke<RecipientListBackend[]>("get_recipient_lists");
  return data.map(mapList);
}

export async function createRecipientList(
  name: string,
  description?: string
): Promise<RecipientList> {
  const data = await invoke<RecipientListBackend>("create_recipient_list", {
    name,
    description: description ?? null,
  });
  return mapList(data);
}

export async function deleteRecipientList(id: string): Promise<void> {
  await invoke("delete_recipient_list", { id });
}

export async function renameRecipientList(
  id: string,
  name: string
): Promise<void> {
  await invoke("rename_recipient_list", { id, name });
}

export async function addRecipientsToList(
  listId: string,
  recipientIds: string[]
): Promise<void> {
  await invoke("add_recipients_to_list", { listId, recipientIds });
}

export async function removeRecipientsFromList(
  listId: string,
  recipientIds: string[]
): Promise<void> {
  await invoke("remove_recipients_from_list", { listId, recipientIds });
}

export async function getListRecipients(
  listId: string
): Promise<ListMember[]> {
  const data = await invoke<ListMemberBackend[]>("get_list_recipients", {
    listId,
  });
  return data.map((m) => ({
    recipientId: m.recipient_id,
    email: m.email,
    name: m.name,
    company: m.company,
    addedAt: new Date(m.added_at),
  }));
}
