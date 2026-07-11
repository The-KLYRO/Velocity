use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;
use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct CampaignData {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub recipient_list_id: Option<String>,
    pub status: String,
    pub broadcast_count: i32,
    pub last_broadcast_at: Option<String>,
    pub total_sent: i32,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BroadcastData {
    pub id: String,
    pub campaign_id: String,
    pub subject: String,
    pub template_id: Option<String>,
    pub status: String,
    pub sent_count: i32,
    pub total_count: i32,
    pub created_at: String,
}

#[command]
pub async fn create_campaign(
    state: State<'_, AppState>,
    name: String,
    description: Option<String>,
    recipient_list_id: Option<String>,
) -> Result<CampaignData, String> {
    let pool = state.get_pool().await?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO campaigns (id, name, description, recipient_list_id, status, broadcast_count, total_sent, created_at) VALUES (?, ?, ?, ?, 'active', 0, 0, ?)"
    )
    .bind(&id)
    .bind(&name)
    .bind(&description)
    .bind(&recipient_list_id)
    .bind(&now)
    .execute(&pool)
    .await
    .map_err(|e| format!("Failed to create campaign: {}", e))?;

    Ok(CampaignData {
        id,
        name,
        description,
        recipient_list_id,
        status: "active".to_string(),
        broadcast_count: 0,
        last_broadcast_at: None,
        total_sent: 0,
        created_at: now,
    })
}

#[command]
pub async fn update_campaign(
    state: State<'_, AppState>,
    id: String,
    updates: serde_json::Value,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    if let Some(status) = updates.get("status").and_then(|v| v.as_str()) {
        sqlx::query("UPDATE campaigns SET status = ? WHERE id = ?")
            .bind(status)
            .bind(&id)
            .execute(&pool)
            .await
            .map_err(|e| format!("Failed to update campaign: {}", e))?;
    }

    Ok(())
}

#[command]
pub async fn get_campaigns(
    state: State<'_, AppState>,
) -> Result<Vec<CampaignData>, String> {
    let pool = state.get_pool().await?;

    let rows: Vec<(String, String, Option<String>, Option<String>, String, i32, Option<String>, i32, String)> = sqlx::query_as(
        "SELECT id, name, description, recipient_list_id, status, broadcast_count, last_broadcast_at, total_sent, created_at FROM campaigns ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to fetch campaigns: {}", e))?;

    Ok(rows.into_iter().map(|r| CampaignData {
        id: r.0,
        name: r.1,
        description: r.2,
        recipient_list_id: r.3,
        status: r.4,
        broadcast_count: r.5,
        last_broadcast_at: r.6,
        total_sent: r.7,
        created_at: r.8,
    }).collect())
}

#[command]
pub async fn delete_campaign(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("DELETE FROM broadcasts WHERE campaign_id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to delete broadcasts: {}", e))?;

    sqlx::query("DELETE FROM campaigns WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to delete campaign: {}", e))?;

    Ok(())
}

// ─── Broadcast Commands ──────────────────────────────────────────

#[command]
pub async fn create_broadcast(
    state: State<'_, AppState>,
    campaign_id: String,
    subject: String,
    template_id: Option<String>,
    total_count: i32,
) -> Result<BroadcastData, String> {
    let pool = state.get_pool().await?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO broadcasts (id, campaign_id, subject, template_id, status, sent_count, total_count, created_at) VALUES (?, ?, ?, ?, 'draft', 0, ?, ?)"
    )
    .bind(&id)
    .bind(&campaign_id)
    .bind(&subject)
    .bind(&template_id)
    .bind(total_count)
    .bind(&now)
    .execute(&pool)
    .await
    .map_err(|e| format!("Failed to create broadcast: {}", e))?;

    sqlx::query(
        "UPDATE campaigns SET broadcast_count = broadcast_count + 1, last_broadcast_at = ? WHERE id = ?"
    )
    .bind(&now)
    .bind(&campaign_id)
    .execute(&pool)
    .await
    .map_err(|e| format!("Failed to update campaign: {}", e))?;

    Ok(BroadcastData {
        id,
        campaign_id,
        subject,
        template_id,
        status: "draft".to_string(),
        sent_count: 0,
        total_count,
        created_at: now,
    })
}

#[command]
pub async fn get_broadcasts(
    state: State<'_, AppState>,
    campaign_id: String,
) -> Result<Vec<BroadcastData>, String> {
    let pool = state.get_pool().await?;

    let rows: Vec<(String, String, String, Option<String>, String, i32, i32, String)> = sqlx::query_as(
        "SELECT id, campaign_id, subject, template_id, status, sent_count, total_count, created_at FROM broadcasts WHERE campaign_id = ? ORDER BY created_at DESC"
    )
    .bind(&campaign_id)
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to fetch broadcasts: {}", e))?;

    Ok(rows.into_iter().map(|r| BroadcastData {
        id: r.0,
        campaign_id: r.1,
        subject: r.2,
        template_id: r.3,
        status: r.4,
        sent_count: r.5,
        total_count: r.6,
        created_at: r.7,
    }).collect())
}

#[command]
pub async fn start_broadcast(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("UPDATE broadcasts SET status = 'running' WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to start broadcast: {}", e))?;

    Ok(())
}

#[command]
pub async fn pause_broadcast(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("UPDATE broadcasts SET status = 'paused' WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to pause broadcast: {}", e))?;

    Ok(())
}

#[command]
pub async fn resume_broadcast(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("UPDATE broadcasts SET status = 'running' WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to resume broadcast: {}", e))?;

    Ok(())
}

#[command]
pub async fn get_last_broadcast(
    state: State<'_, AppState>,
    campaign_id: String,
) -> Result<Option<BroadcastData>, String> {
    let pool = state.get_pool().await?;

    let row: Option<(String, String, String, Option<String>, String, i32, i32, String)> = sqlx::query_as(
        "SELECT id, campaign_id, subject, template_id, status, sent_count, total_count, created_at FROM broadcasts WHERE campaign_id = ? ORDER BY created_at DESC LIMIT 1"
    )
    .bind(&campaign_id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| format!("Failed to fetch last broadcast: {}", e))?;

    Ok(row.map(|r| BroadcastData {
        id: r.0,
        campaign_id: r.1,
        subject: r.2,
        template_id: r.3,
        status: r.4,
        sent_count: r.5,
        total_count: r.6,
        created_at: r.7,
    }))
}
