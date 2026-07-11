use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;
use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct SettingData {
    pub id: String,
    pub key: String,
    pub value: String,
}

#[command]
pub async fn get_all_settings(
    state: State<'_, AppState>,
) -> Result<Vec<SettingData>, String> {
    let pool = state.get_pool().await?;

    let rows: Vec<(String, String, String)> = sqlx::query_as(
        "SELECT id, key, value FROM settings ORDER BY key"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to fetch settings: {}", e))?;

    Ok(rows.into_iter().map(|r| SettingData {
        id: r.0,
        key: r.1,
        value: r.2,
    }).collect())
}

#[command]
pub async fn get_setting(
    state: State<'_, AppState>,
    key: String,
) -> Result<Option<String>, String> {
    let pool = state.get_pool().await?;

    let row: Option<(String,)> = sqlx::query_as(
        "SELECT value FROM settings WHERE key = ?"
    )
    .bind(&key)
    .fetch_optional(&pool)
    .await
    .map_err(|e| format!("Failed to fetch setting: {}", e))?;

    Ok(row.map(|r| r.0))
}

#[command]
pub async fn upsert_setting(
    state: State<'_, AppState>,
    key: String,
    value: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO settings (id, key, value, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?"
    )
    .bind(&id)
    .bind(&key)
    .bind(&value)
    .bind(&now)
    .bind(&value)
    .bind(&now)
    .execute(&pool)
    .await
    .map_err(|e| format!("Failed to upsert setting: {}", e))?;

    Ok(())
}

#[command]
pub async fn upsert_settings_batch(
    state: State<'_, AppState>,
    settings: Vec<(String, String)>,
) -> Result<(), String> {
    let pool = state.get_pool().await?;
    let now = chrono::Utc::now().to_rfc3339();

    for (key, value) in &settings {
        let id = uuid::Uuid::new_v4().to_string();
        sqlx::query(
            "INSERT INTO settings (id, key, value, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?"
        )
        .bind(&id)
        .bind(key)
        .bind(value)
        .bind(&now)
        .bind(value)
        .bind(&now)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to upsert setting {}: {}", key, e))?;
    }

    Ok(())
}

#[command]
pub async fn delete_setting(
    state: State<'_, AppState>,
    key: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("DELETE FROM settings WHERE key = ?")
        .bind(&key)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to delete setting: {}", e))?;

    Ok(())
}
