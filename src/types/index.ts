export type CampaignStatus = "active" | "paused" | "archived";

export type BroadcastStatus = "draft" | "running" | "paused" | "completed" | "failed";

export type RecipientStatus = "active" | "unsubscribed" | "bounced" | "invalid";

export type SmtpEncryption = "none" | "tls" | "starttls";

export type LogEvent = "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed";

export type LogStatus = "success" | "pending" | "failed";

export type QueueStatus = "pending" | "processing" | "sent" | "failed" | "cancelled";

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  recipientListId?: string;
  status: CampaignStatus;
  createdAt: Date;
  broadcastCount: number;
  lastBroadcastAt?: Date;
  totalSent: number;
}

export interface Broadcast {
  id: string;
  campaignId: string;
  subject: string;
  templateId?: string;
  status: BroadcastStatus;
  sentCount: number;
  totalCount: number;
  createdAt: Date;
}

export interface Recipient {
  id: string;
  email: string;
  name: string;
  company?: string;
  status: RecipientStatus;
  tags: string[];
  createdAt: Date;
  lastSent?: Date;
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables: string[];
  createdAt: Date;
}

export interface SmtpAccount {
  id: string;
  email: string;
  password?: string;
  host: string;
  port: number;
  encryption: SmtpEncryption;
  dailyLimit: number;
  delayMs: number;
  retryCount: number;
  isConnected: boolean;
}

export interface LogEntry {
  id: string;
  campaignId: string;
  recipientId: string;
  event: LogEvent;
  status: LogStatus;
  timestamp: Date;
  details?: string;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
}

export interface QueueItem {
  id: string;
  campaignId: string;
  recipientId: string;
  status: QueueStatus;
  attempts: number;
  nextRetry?: Date;
  createdAt: Date;
}
