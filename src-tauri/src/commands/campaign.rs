use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;
use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct CampaignData {
    pub id: String,
    pub name: String,
    pub status: String,
    pub template_id: Option<String>,
    pub created_at: String,
    pub sent_count: i32,
    pub total_count: i32,
}

#[command]
pub async fn create_campaign(
    state: State<'_, AppState>,
    name: String,
    template_id: Option<String>,
    total_count: i32,
) -> Result<CampaignData, String> {
    let pool = state.get_pool().await?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO campaigns (id, name, status, template_id, created_at, sent_count, total_count) VALUES (?, ?, 'draft', ?, ?, 0, ?)"
    )
    .bind(&id)
    .bind(&name)
    .bind(&template_id)
    .bind(&now)
    .bind(total_count)
    .execute(&pool)
    .await
    .map_err(|e| format!("Failed to create campaign: {}", e))?;

    Ok(CampaignData {
        id,
        name,
        status: "draft".to_string(),
        template_id,
        created_at: now,
        sent_count: 0,
        total_count,
    })
}

#[command]
pub async fn start_campaign(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("UPDATE campaigns SET status = 'running' WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to start campaign: {}", e))?;

    Ok(())
}

#[command]
pub async fn pause_campaign(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("UPDATE campaigns SET status = 'paused' WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to pause campaign: {}", e))?;

    Ok(())
}

#[command]
pub async fn resume_campaign(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("UPDATE campaigns SET status = 'running' WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to resume campaign: {}", e))?;

    Ok(())
}

#[command]
pub async fn get_campaigns(
    state: State<'_, AppState>,
) -> Result<Vec<CampaignData>, String> {
    let pool = state.get_pool().await?;

    let rows: Vec<(String, String, String, Option<String>, String, i32, i32)> = sqlx::query_as(
        "SELECT id, name, status, template_id, created_at, sent_count, total_count FROM campaigns ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to fetch campaigns: {}", e))?;

    Ok(rows.into_iter().map(|r| CampaignData {
        id: r.0,
        name: r.1,
        status: r.2,
        template_id: r.3,
        created_at: r.4,
        sent_count: r.5,
        total_count: r.6,
    }).collect())
}

#[command]
pub async fn delete_campaign(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("DELETE FROM campaigns WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to delete campaign: {}", e))?;

    Ok(())
}
