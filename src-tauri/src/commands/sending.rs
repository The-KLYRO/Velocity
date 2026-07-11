use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;
use crate::state::AppState;
use base64::Engine;
use lettre::message::header::{ContentDisposition, ContentType, ContentId};
use lettre::message::{MultiPart, SinglePart};
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

fn extract_inline_images(html: &str) -> (String, Vec<(String, String, Vec<u8>)>) {
    let mut cleaned = html.to_string();
    let mut images: Vec<(String, String, Vec<u8>)> = Vec::new();
    let mut search_start = 0;

    while let Some(img_pos) = cleaned[search_start..].find("<img") {
        let abs_pos = search_start + img_pos;
        let tag_end = match cleaned[abs_pos..].find('>') {
            Some(p) => abs_pos + p + 1,
            None => break,
        };
        let tag = &cleaned[abs_pos..tag_end];

        let src_start = match tag.find("src=\"") {
            Some(p) => p + 5,
            None => {
                search_start = tag_end;
                continue;
            }
        };
        let src_end = match tag[src_start..].find('"') {
            Some(p) => src_start + p,
            None => {
                search_start = tag_end;
                continue;
            }
        };
        let src = &tag[src_start..src_end];

        if !src.starts_with("data:") {
            search_start = tag_end;
            continue;
        }

        let data_str = &src[5..];
        let (mime, b64_data) = match data_str.find(",") {
            Some(comma_pos) => {
                let header = &data_str[..comma_pos];
                let payload = &data_str[comma_pos + 1..];
                let mime = header.trim_end_matches(";base64").to_string();
                (mime, payload.to_string())
            }
            None => {
                search_start = tag_end;
                continue;
            }
        };

        let cid = format!("img-{}-{}", images.len(), uuid::Uuid::new_v4());
        let img_bytes = match base64::engine::general_purpose::STANDARD.decode(&b64_data) {
            Ok(b) => b,
            Err(_) => {
                search_start = tag_end;
                continue;
            }
        };

        let new_tag = tag.replace(src, &format!("cid:{}@velocity", cid));
        cleaned = format!("{}{}{}", &cleaned[..abs_pos], new_tag, &cleaned[tag_end..]);
        images.push((cid, mime, img_bytes));
        search_start = abs_pos + new_tag.len();
    }

    (cleaned, images)
}

fn build_transport(host: &str, port: u16, password: &str, email: &str) -> Result<AsyncSmtpTransport<Tokio1Executor>, String> {
    let clean_password = password.replace(' ', "");
    let creds = Credentials::new(email.to_string(), clean_password);

    match port {
        465 => {
            let t = AsyncSmtpTransport::<Tokio1Executor>::relay(host)
                .map_err(|e| format!("Failed to create relay: {}", e))?
                .credentials(creds)
                .port(port)
                .build();
            Ok(t)
        }
        _ => {
            let t = AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(host)
                .map_err(|e| format!("Failed to create relay: {}", e))?
                .credentials(creds)
                .port(port)
                .build();
            Ok(t)
        }
    }
}

fn build_multipart_message(
    from: lettre::message::Mailbox,
    to: lettre::message::Mailbox,
    subject: &str,
    html: &str,
    images: &[(String, String, Vec<u8>)],
) -> Result<Message, String> {
    let builder = Message::builder()
        .from(from)
        .to(to)
        .subject(subject);

    if images.is_empty() {
        builder
            .header(ContentType::TEXT_HTML)
            .body(html.to_string())
            .map_err(|e| format!("Failed to build message: {}", e))
    } else {
        let html_part = SinglePart::builder()
            .header(ContentType::TEXT_HTML)
            .body(html.to_string());

        let mut multipart = MultiPart::mixed().singlepart(html_part);

        for (cid, mime, data) in images {
            let ct = ContentType::parse(mime)
                .unwrap_or_else(|_| ContentType::parse("application/octet-stream").unwrap());
            let part = SinglePart::builder()
                .header(ct)
                .header(ContentId::from(format!("<{}@velocity>", cid)))
                .header(ContentDisposition::inline())
                .body(data.clone());
            multipart = multipart.singlepart(part);
        }

        builder
            .multipart(multipart)
            .map_err(|e| format!("Failed to build message: {}", e))
    }
}

#[command]
pub async fn send_email(req: SendEmailRequest) -> Result<SendEmailResult, String> {
    let transport = build_transport(&req.smtp_host, req.smtp_port, &req.smtp_password, &req.smtp_email)?;

    let from: lettre::message::Mailbox = req.smtp_email.parse()
        .map_err(|e| format!("Invalid from address: {}", e))?;
    let to: lettre::message::Mailbox = req.to.parse()
        .map_err(|e| format!("Invalid to address: {}", e))?;

    let (clean_html, images) = extract_inline_images(&req.body_html);
    let email = build_multipart_message(from, to, &req.subject, &clean_html, &images)?;

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
    let transport = build_transport(&req.smtp_host, req.smtp_port, &req.smtp_password, &req.smtp_email)?;

    let total = req.recipient_emails.len();
    let mut sent: usize = 0;
    let mut failed: usize = 0;
    let mut errors: Vec<String> = Vec::new();

    let now = chrono::Utc::now().to_rfc3339();

    let from_mailbox: lettre::message::Mailbox = req.smtp_email
        .parse()
        .map_err(|e| format!("Invalid from address '{}': {}", req.smtp_email, e))?;

    let (clean_html, images) = extract_inline_images(&req.body_html);

    for recipient in &req.recipient_emails {
        let to_mailbox = match recipient.parse() {
            Ok(m) => m,
            Err(e) => {
                errors.push(format!("{}: invalid email address: {}", recipient, e));
                failed += 1;
                continue;
            }
        };

        let email = match build_multipart_message(
            from_mailbox.clone(),
            to_mailbox,
            &req.subject,
            &clean_html,
            &images,
        ) {
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
