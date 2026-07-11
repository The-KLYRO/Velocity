use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;
use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct RecipientData {
    pub id: String,
    pub email: String,
    pub name: String,
    pub company: Option<String>,
    pub status: String,
    pub tags: Vec<String>,
    pub created_at: String,
    pub last_sent: Option<String>,
}

#[command]
pub async fn add_recipient(
    state: State<'_, AppState>,
    email: String,
    name: String,
    company: Option<String>,
) -> Result<RecipientData, String> {
    let pool = state.get_pool().await?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO recipients (id, email, name, company, status, tags, created_at) VALUES (?, ?, ?, ?, 'active', '[]', ?)"
    )
    .bind(&id)
    .bind(&email)
    .bind(&name)
    .bind(&company)
    .bind(&now)
    .execute(&pool)
    .await
    .map_err(|e| format!("Failed to add recipient: {}", e))?;

    Ok(RecipientData {
        id,
        email,
        name,
        company,
        status: "active".to_string(),
        tags: vec![],
        created_at: now,
        last_sent: None,
    })
}

#[command]
pub async fn get_recipients(
    state: State<'_, AppState>,
    filter: Option<String>,
    page: Option<i64>,
    per_page: Option<i64>,
) -> Result<(Vec<RecipientData>, i64), String> {
    let pool = state.get_pool().await?;
    let page = page.unwrap_or(1);
    let per_page = per_page.unwrap_or(50);
    let offset = (page - 1) * per_page;

    let (count_query, data_query) = match filter.as_deref() {
        Some("active") | Some("unsubscribed") | Some("bounced") | Some("invalid") => {
            (
                format!("SELECT COUNT(*) FROM recipients WHERE status = '{}'", filter.as_deref().unwrap()),
                format!("SELECT id, email, name, company, status, tags, created_at, last_sent FROM recipients WHERE status = '{}' ORDER BY created_at DESC LIMIT {} OFFSET {}", filter.as_deref().unwrap(), per_page, offset),
            )
        }
        _ => {
            (
                "SELECT COUNT(*) FROM recipients".to_string(),
                format!("SELECT id, email, name, company, status, tags, created_at, last_sent FROM recipients ORDER BY created_at DESC LIMIT {} OFFSET {}", per_page, offset),
            )
        }
    };

    let total: (i64,) = sqlx::query_as(&count_query)
        .fetch_one(&pool)
        .await
        .map_err(|e| format!("Failed to count recipients: {}", e))?;

    let rows: Vec<(String, String, String, Option<String>, String, String, String, Option<String>)> = sqlx::query_as(&data_query)
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Failed to fetch recipients: {}", e))?;

    Ok((rows.into_iter().map(|r| {
        let tags: Vec<String> = serde_json::from_str(&r.5).unwrap_or_default();
        RecipientData {
            id: r.0,
            email: r.1,
            name: r.2,
            company: r.3,
            status: r.4,
            tags,
            created_at: r.6,
            last_sent: r.7,
        }
    }).collect(), total.0))
}

#[command]
pub async fn search_recipients(
    state: State<'_, AppState>,
    query: String,
    page: Option<i64>,
    per_page: Option<i64>,
) -> Result<(Vec<RecipientData>, i64), String> {
    let pool = state.get_pool().await?;
    let page = page.unwrap_or(1);
    let per_page = per_page.unwrap_or(50);
    let offset = (page - 1) * per_page;
    let like_query = format!("%{}%", query);

    let total: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM recipients WHERE name LIKE ? OR email LIKE ? OR company LIKE ?"
    )
    .bind(&like_query)
    .bind(&like_query)
    .bind(&like_query)
    .fetch_one(&pool)
    .await
    .map_err(|e| format!("Failed to count recipients: {}", e))?;

    let rows: Vec<(String, String, String, Option<String>, String, String, String, Option<String>)> = sqlx::query_as(
        "SELECT id, email, name, company, status, tags, created_at, last_sent FROM recipients WHERE name LIKE ? OR email LIKE ? OR company LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
    )
    .bind(&like_query)
    .bind(&like_query)
    .bind(&like_query)
    .bind(per_page)
    .bind(offset)
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to search recipients: {}", e))?;

    Ok((rows.into_iter().map(|r| {
        let tags: Vec<String> = serde_json::from_str(&r.5).unwrap_or_default();
        RecipientData {
            id: r.0,
            email: r.1,
            name: r.2,
            company: r.3,
            status: r.4,
            tags,
            created_at: r.6,
            last_sent: r.7,
        }
    }).collect(), total.0))
}

#[command]
pub async fn update_recipient_status(
    state: State<'_, AppState>,
    id: String,
    status: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("UPDATE recipients SET status = ? WHERE id = ?")
        .bind(&status)
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to update recipient status: {}", e))?;

    Ok(())
}

#[command]
pub async fn delete_recipients(
    state: State<'_, AppState>,
    ids: Vec<String>,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    for id in &ids {
        sqlx::query("DELETE FROM recipients WHERE id = ?")
            .bind(id)
            .execute(&pool)
            .await
            .map_err(|e| format!("Failed to delete recipient {}: {}", id, e))?;
    }

    Ok(())
}

#[command]
pub async fn import_recipients_csv(
    state: State<'_, AppState>,
    file_path: String,
) -> Result<Vec<RecipientData>, String> {
    let pool = state.get_pool().await?;
    let mut rdr = csv::Reader::from_path(&file_path)
        .map_err(|e| format!("Failed to read CSV file: {}", e))?;

    let headers: Vec<String> = rdr.headers()
        .map_err(|e| format!("Failed to read CSV headers: {}", e))?
        .iter()
        .map(|h| h.to_lowercase().trim().to_string())
        .collect();

    let email_idx = headers.iter().position(|h| h == "email" || h == "e-mail" || h == "email_address")
        .ok_or("CSV must contain an 'email' column")?;
    let name_idx = headers.iter().position(|h| h == "name" || h == "full_name" || h == "first_name");
    let company_idx = headers.iter().position(|h| h == "company" || h == "organization");

    let mut recipients = Vec::new();

    for result in rdr.records() {
        let record = result.map_err(|e| format!("Failed to read CSV record: {}", e))?;

        let email = record.get(email_idx)
            .ok_or("Missing email value")?
            .to_string();

        if email.is_empty() || !email.contains('@') {
            continue;
        }

        let name = name_idx
            .and_then(|i| record.get(i))
            .filter(|s| !s.is_empty())
            .unwrap_or(&email)
            .to_string();

        let company = company_idx
            .and_then(|i| record.get(i))
            .filter(|s| !s.is_empty())
            .map(|s| s.to_string());

        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();

        sqlx::query(
            "INSERT OR IGNORE INTO recipients (id, email, name, company, status, tags, created_at) VALUES (?, ?, ?, ?, 'active', '[]', ?)"
        )
        .bind(&id)
        .bind(&email)
        .bind(&name)
        .bind(&company)
        .bind(&now)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to insert recipient: {}", e))?;

        recipients.push(RecipientData {
            id,
            email,
            name,
            company,
            status: "active".to_string(),
            tags: vec![],
            created_at: now,
            last_sent: None,
        });
    }

    Ok(recipients)
}
