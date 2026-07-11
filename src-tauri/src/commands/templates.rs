use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;
use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct TemplateData {
    pub id: String,
    pub name: String,
    pub subject: String,
    pub body_html: String,
    pub body_text: Option<String>,
    pub variables: Vec<String>,
    pub created_at: String,
}

#[command]
pub async fn create_template(
    state: State<'_, AppState>,
    name: String,
    subject: String,
    body_html: String,
    body_text: Option<String>,
    variables: Vec<String>,
) -> Result<TemplateData, String> {
    let pool = state.get_pool().await?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let vars_json = serde_json::to_string(&variables).unwrap_or_else(|_| "[]".to_string());

    sqlx::query(
        "INSERT INTO templates (id, name, subject, body_html, body_text, variables, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&name)
    .bind(&subject)
    .bind(&body_html)
    .bind(&body_text)
    .bind(&vars_json)
    .bind(&now)
    .execute(&pool)
    .await
    .map_err(|e| format!("Failed to create template: {}", e))?;

    Ok(TemplateData {
        id,
        name,
        subject,
        body_html,
        body_text,
        variables,
        created_at: now,
    })
}

#[command]
pub async fn update_template(
    state: State<'_, AppState>,
    id: String,
    name: Option<String>,
    subject: Option<String>,
    body_html: Option<String>,
    body_text: Option<String>,
    variables: Option<Vec<String>>,
) -> Result<TemplateData, String> {
    let pool = state.get_pool().await?;

    // Fetch current template
    let row: (String, String, String, String, Option<String>, String, String) = sqlx::query_as(
        "SELECT id, name, subject, body_html, body_text, variables, created_at FROM templates WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&pool)
    .await
    .map_err(|e| format!("Template not found: {}", e))?;

    let new_name = name.unwrap_or(row.1);
    let new_subject = subject.unwrap_or(row.2);
    let new_body_html = body_html.unwrap_or(row.3);
    let new_body_text = body_text.or(row.4);
    let new_variables = variables.map(|v| serde_json::to_string(&v).unwrap_or_else(|_| "[]".to_string())).unwrap_or(row.5);

    sqlx::query(
        "UPDATE templates SET name = ?, subject = ?, body_html = ?, body_text = ?, variables = ? WHERE id = ?"
    )
    .bind(&new_name)
    .bind(&new_subject)
    .bind(&new_body_html)
    .bind(&new_body_text)
    .bind(&new_variables)
    .bind(&id)
    .execute(&pool)
    .await
    .map_err(|e| format!("Failed to update template: {}", e))?;

    let vars: Vec<String> = serde_json::from_str(&new_variables).unwrap_or_default();

    Ok(TemplateData {
        id,
        name: new_name,
        subject: new_subject,
        body_html: new_body_html,
        body_text: new_body_text,
        variables: vars,
        created_at: row.6,
    })
}

#[command]
pub async fn delete_template(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let pool = state.get_pool().await?;

    sqlx::query("DELETE FROM templates WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to delete template: {}", e))?;

    Ok(())
}

#[command]
pub async fn get_templates(
    state: State<'_, AppState>,
) -> Result<Vec<TemplateData>, String> {
    let pool = state.get_pool().await?;

    let rows: Vec<(String, String, String, String, Option<String>, String, String)> = sqlx::query_as(
        "SELECT id, name, subject, body_html, body_text, variables, created_at FROM templates ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to fetch templates: {}", e))?;

    Ok(rows.into_iter().map(|r| {
        let vars: Vec<String> = serde_json::from_str(&r.5).unwrap_or_default();
        TemplateData {
            id: r.0,
            name: r.1,
            subject: r.2,
            body_html: r.3,
            body_text: r.4,
            variables: vars,
            created_at: r.6,
        }
    }).collect())
}
