use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Campaign {
    pub id: String,
    pub name: String,
    pub status: CampaignStatus,
    pub template_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub sent_count: i32,
    pub total_count: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum CampaignStatus {
    Draft,
    Running,
    Paused,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recipient {
    pub id: String,
    pub email: String,
    pub name: String,
    pub company: Option<String>,
    pub status: RecipientStatus,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub last_sent: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum RecipientStatus {
    Active,
    Unsubscribed,
    Bounced,
    Invalid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Template {
    pub id: String,
    pub name: String,
    pub subject: String,
    pub body_html: String,
    pub body_text: Option<String>,
    pub variables: Vec<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmtpAccount {
    pub id: String,
    pub email: String,
    pub host: String,
    pub port: u16,
    pub encryption: SmtpEncryption,
    pub daily_limit: i32,
    pub delay_ms: u32,
    pub retry_count: i32,
    pub is_connected: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum SmtpEncryption {
    None,
    Tls,
    StartTls,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub id: String,
    pub campaign_id: String,
    pub recipient_id: String,
    pub event: LogEvent,
    pub status: LogStatus,
    pub timestamp: DateTime<Utc>,
    pub details: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LogEvent {
    Sent,
    Delivered,
    Opened,
    Clicked,
    Bounced,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LogStatus {
    Success,
    Pending,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub id: String,
    pub key: String,
    pub value: String,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueItem {
    pub id: String,
    pub campaign_id: String,
    pub recipient_id: String,
    pub status: QueueStatus,
    pub attempts: i32,
    pub next_retry: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum QueueStatus {
    Pending,
    Processing,
    Sent,
    Failed,
    Cancelled,
}
