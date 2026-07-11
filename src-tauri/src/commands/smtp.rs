use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;
use crate::state::AppState;
use crate::crypto;

#[command]
pub async fn get_smtp_account_password(
    state: State<'_, AppState>,
    id: String,
) -> Result<String, String> {
    let pool = state.get_pool().await?;

    let row: Option<(Option<String>,)> = sqlx::query_as(
        "SELECT password FROM smtp_accounts WHERE id = ?"
    )
    .bind(&id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| format!("Failed to fetch SMTP password: {}", e))?;

    match row {
        Some((Some(encrypted),)) => crypto::decrypt(&encrypted),
        _ => Err("No password stored for this account".to_string()),
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SmtpAccountData {
    pub id: String,
    pub email: String,
    pub host: String,
    pub port: u16,
    pub encryption: String,
    pub daily_limit: i32,
    pub delay_ms: u32,
    pub retry_count: i32,
    pub is_connected: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SmtpTestResult {
    pub connected: bool,
    pub message: String,
}

#[command]
pub async fn save_smtp_account(
    state: State<'_, AppState>,
    id: Option<String>,
    email: String,
    password: Option<String>,
    host: String,
    port: u16,
    encryption: String,
    daily_limit: i32,
    delay_ms: u32,
    retry_count: i32,
    is_connected: Option<bool>,
) -> Result<SmtpAccountData, String> {
    let pool = state.get_pool().await?;

    let encrypted_password = password.map(|p| crypto::encrypt(&p));
    let connected = is_connected.unwrap_or(false);

    let account_id = match id {
        Some(existing_id) => {
            if let Some(ref pw) = encrypted_password {
                sqlx::query(
                    "UPDATE smtp_accounts SET email = ?, password = ?, host = ?, port = ?, encryption = ?, daily_limit = ?, delay_ms = ?, retry_count = ?, is_connected = ? WHERE id = ?"
                )
                .bind(&email)
                .bind(pw)
                .bind(&host)
                .bind(port as i64)
                .bind(&encryption)
                .bind(daily_limit)
                .bind(delay_ms as i64)
                .bind(retry_count)
                .bind(connected)
                .bind(&existing_id)
                .execute(&pool)
                .await
                .map_err(|e| format!("Failed to update SMTP account: {}", e))?;
            } else {
                sqlx::query(
                    "UPDATE smtp_accounts SET email = ?, host = ?, port = ?, encryption = ?, daily_limit = ?, delay_ms = ?, retry_count = ?, is_connected = ? WHERE id = ?"
                )
                .bind(&email)
                .bind(&host)
                .bind(port as i64)
                .bind(&encryption)
                .bind(daily_limit)
                .bind(delay_ms as i64)
                .bind(retry_count)
                .bind(connected)
                .bind(&existing_id)
                .execute(&pool)
                .await
                .map_err(|e| format!("Failed to update SMTP account: {}", e))?;
            }
            existing_id
        }
        None => {
            let new_id = uuid::Uuid::new_v4().to_string();
            sqlx::query(
                "INSERT INTO smtp_accounts (id, email, password, host, port, encryption, daily_limit, delay_ms, retry_count, is_connected) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)"
            )
            .bind(&new_id)
            .bind(&email)
            .bind(&encrypted_password)
            .bind(&host)
            .bind(port as i64)
            .bind(&encryption)
            .bind(daily_limit)
            .bind(delay_ms as i64)
            .bind(retry_count)
            .execute(&pool)
            .await
            .map_err(|e| format!("Failed to create SMTP account: {}", e))?;
            new_id
        }
    };

    Ok(SmtpAccountData {
        id: account_id,
        email,
        host,
        port,
        encryption,
        daily_limit,
        delay_ms,
        retry_count,
        is_connected: connected,
    })
}

#[command]
pub async fn get_smtp_accounts(
    state: State<'_, AppState>,
) -> Result<Vec<SmtpAccountData>, String> {
    let pool = state.get_pool().await?;

    let rows: Vec<(String, String, String, i64, String, i64, i64, i64, bool)> = sqlx::query_as(
        "SELECT id, email, host, port, encryption, daily_limit, delay_ms, retry_count, is_connected FROM smtp_accounts ORDER BY email"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to fetch SMTP accounts: {}", e))?;

    Ok(rows.into_iter().map(|r| SmtpAccountData {
        id: r.0,
        email: r.1,
        host: r.2,
        port: r.3 as u16,
        encryption: r.4,
        daily_limit: r.5 as i32,
        delay_ms: r.6 as u32,
        retry_count: r.7 as i32,
        is_connected: r.8,
    }).collect())
}

#[command]
pub async fn delete_smtp_account(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("DELETE FROM smtp_accounts WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to delete SMTP account: {}", e))?;

    Ok(())
}

#[command]
pub async fn update_smtp_connection_status(
    state: State<'_, AppState>,
    id: String,
    is_connected: bool,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("UPDATE smtp_accounts SET is_connected = ? WHERE id = ?")
        .bind(is_connected)
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to update SMTP connection status: {}", e))?;

    Ok(())
}

#[command]
pub async fn test_smtp_connection(
    email: String,
    password: String,
    host: String,
    port: u16,
) -> Result<SmtpTestResult, String> {
    use lettre::transport::smtp::authentication::Credentials;
    use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};

    let clean_password = password.replace(' ', "");
    let creds = Credentials::new(email.clone(), clean_password);

    let transport = match port {
        465 => {
            AsyncSmtpTransport::<Tokio1Executor>::relay(&host)
                .map_err(|e| format!("Failed to create relay: {}", e))?
                .credentials(creds)
                .port(port)
                .build()
        }
        _ => {
            AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&host)
                .map_err(|e| format!("Failed to create STARTTLS relay: {}", e))?
                .credentials(creds)
                .port(port)
                .build()
        }
    };

    let test_email = Message::builder()
        .from(format!("Velocity <{}>", email).parse().map_err(|e| format!("Invalid from address: {}", e))?)
        .to("test@localhost".parse().map_err(|e| format!("Invalid to address: {}", e))?)
        .subject("Velocity - SMTP Test")
        .body("This is a test email to verify your SMTP connection.".to_string())
        .map_err(|e| format!("Failed to build message: {}", e))?;

    match transport.send(test_email).await {
        Ok(_) => Ok(SmtpTestResult {
            connected: true,
            message: format!("Successfully connected to {}:{} as {}", host, port, email),
        }),
        Err(e) => {
            let err_str = e.to_string();
            if err_str.contains("550") || err_str.contains("553") || err_str.contains("rejected") {
                Ok(SmtpTestResult {
                    connected: true,
                    message: format!("Connected to {}:{} as {}. Server is reachable.", host, port, email),
                })
            } else {
                Err(format!("SMTP connection failed: {}", e))
            }
        }
    }
}
