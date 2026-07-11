use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;
use crate::state::AppState;
use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};

#[derive(Debug, Serialize, Deserialize)]
pub struct SendEmailRequest {
    pub to: String,
    pub subject: String,
    pub body_html: String,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_email: String,
    pub smtp_password: String,
    pub smtp_encryption: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SendEmailResult {
    pub success: bool,
    pub message: String,
}

#[command]
pub async fn send_email(req: SendEmailRequest) -> Result<SendEmailResult, String> {
    let clean_password = req.smtp_password.replace(' ', "");
    let creds = Credentials::new(req.smtp_email.clone(), clean_password);

    let transport = match req.smtp_port {
        465 => {
            AsyncSmtpTransport::<Tokio1Executor>::relay(&req.smtp_host)
                .map_err(|e| format!("Failed to create relay: {}", e))?
                .credentials(creds)
                .port(req.smtp_port)
                .build()
        }
        _ => {
            AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&req.smtp_host)
                .map_err(|e| format!("Failed to create relay: {}", e))?
                .credentials(creds)
                .port(req.smtp_port)
                .build()
        }
    };

    let email = Message::builder()
        .from(format!("{} <{}>", req.smtp_email, req.smtp_email).parse().map_err(|e| format!("Invalid from address: {}", e))?)
        .to(req.to.parse().map_err(|e| format!("Invalid to address: {}", e))?)
        .subject(&req.subject)
        .header(ContentType::TEXT_HTML)
        .body(req.body_html)
        .map_err(|e| format!("Failed to build message: {}", e))?;

    match transport.send(email).await {
        Ok(_) => Ok(SendEmailResult {
            success: true,
            message: "Email sent successfully".to_string(),
        }),
        Err(e) => Ok(SendEmailResult {
            success: false,
            message: format!("Failed to send: {}", e),
        }),
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SendBroadcastRequest {
    pub campaign_id: String,
    pub broadcast_id: String,
    pub subject: String,
    pub body_html: String,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_email: String,
    pub smtp_password: String,
    pub smtp_encryption: String,
    pub recipient_emails: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SendBroadcastResult {
    pub total: usize,
    pub sent: usize,
    pub failed: usize,
    pub errors: Vec<String>,
}

#[command]
pub async fn send_broadcast(
    state: State<'_, AppState>,
    req: SendBroadcastRequest,
) -> Result<SendBroadcastResult, String> {
    let pool = state.get_pool().await?;

    let clean_password = req.smtp_password.replace(' ', "");
    let creds = Credentials::new(req.smtp_email.clone(), clean_password);

    let transport = match req.smtp_port {
        465 => {
            AsyncSmtpTransport::<Tokio1Executor>::relay(&req.smtp_host)
                .map_err(|e| format!("Failed to create relay: {}", e))?
                .credentials(creds)
                .port(req.smtp_port)
                .build()
        }
        _ => {
            AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&req.smtp_host)
                .map_err(|e| format!("Failed to create relay: {}", e))?
                .credentials(creds)
                .port(req.smtp_port)
                .build()
        }
    };

    let total = req.recipient_emails.len();
    let mut sent: usize = 0;
    let mut failed: usize = 0;
    let mut errors: Vec<String> = Vec::new();

    let now = chrono::Utc::now().to_rfc3339();

    for recipient in &req.recipient_emails {
        let from_mailbox = format!("{} <{}>", req.smtp_email, req.smtp_email)
            .parse()
            .map_err(|e| format!("Invalid from: {}", e))?;
        let to_mailbox = recipient
            .parse()
            .map_err(|e| format!("Invalid to {}: {}", recipient, e))?;

        let email = match Message::builder()
            .from(from_mailbox)
            .to(to_mailbox)
            .subject(&req.subject)
            .header(ContentType::TEXT_HTML)
            .body(req.body_html.clone())
        {
            Ok(e) => e,
            Err(e) => {
                errors.push(format!("{}: {}", recipient, e));
                failed += 1;
                continue;
            }
        };

        match transport.send(email).await {
            Ok(_) => {
                sent += 1;
                let _ = sqlx::query(
                    "INSERT INTO logs (id, campaign_id, recipient_id, event, status, timestamp) VALUES (?, ?, ?, 'sent', 'success', ?)"
                )
                .bind(uuid::Uuid::new_v4().to_string())
                .bind(&req.campaign_id)
                .bind(recipient)
                .bind(&now)
                .execute(&pool)
                .await;
            }
            Err(e) => {
                errors.push(format!("{}: {}", recipient, e));
                failed += 1;
                let _ = sqlx::query(
                    "INSERT INTO logs (id, campaign_id, recipient_id, event, status, timestamp, details) VALUES (?, ?, ?, 'sent', 'failed', ?, ?)"
                )
                .bind(uuid::Uuid::new_v4().to_string())
                .bind(&req.campaign_id)
                .bind(recipient)
                .bind(&now)
                .bind(e.to_string())
                .execute(&pool)
                .await;
            }
        }
    }

    let _ = sqlx::query(
        "UPDATE broadcasts SET sent_count = sent_count + ?, status = 'completed' WHERE id = ?"
    )
    .bind(sent as i64)
    .bind(&req.broadcast_id)
    .execute(&pool)
    .await;

    let _ = sqlx::query(
        "UPDATE campaigns SET total_sent = total_sent + ? WHERE id = ?"
    )
    .bind(sent as i64)
    .bind(&req.campaign_id)
    .execute(&pool)
    .await;

    Ok(SendBroadcastResult {
        total,
        sent,
        failed,
        errors,
    })
}
