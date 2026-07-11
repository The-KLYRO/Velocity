use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;
use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct RecipientListData {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
    pub member_count: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ListMemberData {
    pub recipient_id: String,
    pub email: String,
    pub name: String,
    pub company: Option<String>,
    pub added_at: String,
}

#[command]
pub async fn create_recipient_list(
    state: State<'_, AppState>,
    name: String,
    description: Option<String>,
) -> Result<RecipientListData, String> {
    let pool = state.get_pool().await?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO recipient_lists (id, name, description, created_at) VALUES (?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&name)
    .bind(&description)
    .bind(&now)
    .execute(&pool)
    .await
    .map_err(|e| format!("Failed to create list: {}", e))?;

    Ok(RecipientListData {
        id,
        name,
        description,
        created_at: now,
        member_count: 0,
    })
}

#[command]
pub async fn get_recipient_lists(
    state: State<'_, AppState>,
) -> Result<Vec<RecipientListData>, String> {
    let pool = state.get_pool().await?;

    let rows: Vec<(String, String, Option<String>, String)> = sqlx::query_as(
        "SELECT id, name, description, created_at FROM recipient_lists ORDER BY name"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to fetch lists: {}", e))?;

    let mut lists = Vec::new();
    for r in rows {
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM recipient_list_members WHERE list_id = ?"
        )
        .bind(&r.0)
        .fetch_one(&pool)
        .await
        .map_err(|e| format!("Failed to count list members: {}", e))?;

        lists.push(RecipientListData {
            id: r.0,
            name: r.1,
            description: r.2,
            created_at: r.3,
            member_count: count.0,
        });
    }

    Ok(lists)
}

#[command]
pub async fn delete_recipient_list(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("DELETE FROM recipient_list_members WHERE list_id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to delete list members: {}", e))?;

    sqlx::query("DELETE FROM recipient_lists WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to delete list: {}", e))?;

    Ok(())
}

#[command]
pub async fn rename_recipient_list(
    state: State<'_, AppState>,
    id: String,
    name: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("UPDATE recipient_lists SET name = ? WHERE id = ?")
        .bind(&name)
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to rename list: {}", e))?;

    Ok(())
}

#[command]
pub async fn add_recipients_to_list(
    state: State<'_, AppState>,
    list_id: String,
    recipient_ids: Vec<String>,
) -> Result<(), String> {
    let pool = state.get_pool().await?;
    let now = chrono::Utc::now().to_rfc3339();

    for rid in &recipient_ids {
        sqlx::query(
            "INSERT OR IGNORE INTO recipient_list_members (list_id, recipient_id, added_at) VALUES (?, ?, ?)"
        )
        .bind(&list_id)
        .bind(rid)
        .bind(&now)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to add recipient {} to list: {}", rid, e))?;
    }

    Ok(())
}

#[command]
pub async fn remove_recipients_from_list(
    state: State<'_, AppState>,
    list_id: String,
    recipient_ids: Vec<String>,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    for rid in &recipient_ids {
        sqlx::query("DELETE FROM recipient_list_members WHERE list_id = ? AND recipient_id = ?")
            .bind(&list_id)
            .bind(rid)
            .execute(&pool)
            .await
            .map_err(|e| format!("Failed to remove recipient {} from list: {}", rid, e))?;
    }

    Ok(())
}

#[command]
pub async fn get_list_recipients(
    state: State<'_, AppState>,
    list_id: String,
) -> Result<Vec<ListMemberData>, String> {
    let pool = state.get_pool().await?;

    let rows: Vec<(String, String, String, Option<String>, String)> = sqlx::query_as(
        "SELECT r.id, r.email, r.name, r.company, m.added_at FROM recipient_list_members m JOIN recipients r ON m.recipient_id = r.id WHERE m.list_id = ? ORDER BY m.added_at"
    )
    .bind(&list_id)
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to fetch list members: {}", e))?;

    Ok(rows.into_iter().map(|r| ListMemberData {
        recipient_id: r.0,
        email: r.1,
        name: r.2,
        company: r.3,
        added_at: r.4,
    }).collect())
}
