use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;
use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct LogData {
    pub id: String,
    pub campaign_id: String,
    pub recipient_id: String,
    pub event: String,
    pub status: String,
    pub timestamp: String,
    pub details: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogDataWithInfo {
    pub id: String,
    pub campaign_id: String,
    pub campaign_name: String,
    pub recipient_email: String,
    pub event: String,
    pub status: String,
    pub timestamp: String,
    pub details: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardStats {
    pub total_sent: i64,
    pub total_recipients: i64,
    pub active_campaigns: i64,
    pub completed_campaigns: i64,
    pub delivery_rate: f64,
}

#[command]
pub async fn get_campaign_logs(
    state: State<'_, AppState>,
    campaign_id: Option<String>,
) -> Result<Vec<LogData>, String> {
    let pool = state.get_pool().await?;

    let rows: Vec<(String, String, String, String, String, String, Option<String>)> = match campaign_id {
        Some(cid) => {
            sqlx::query_as(
                "SELECT id, campaign_id, recipient_id, event, status, timestamp, details FROM logs WHERE campaign_id = ? ORDER BY timestamp DESC"
            )
            .bind(&cid)
            .fetch_all(&pool)
            .await
            .map_err(|e| format!("Failed to fetch logs: {}", e))?
        }
        None => {
            sqlx::query_as(
                "SELECT id, campaign_id, recipient_id, event, status, timestamp, details FROM logs ORDER BY timestamp DESC LIMIT 100"
            )
            .fetch_all(&pool)
            .await
            .map_err(|e| format!("Failed to fetch logs: {}", e))?
        }
    };

    Ok(rows.into_iter().map(|r| LogData {
        id: r.0,
        campaign_id: r.1,
        recipient_id: r.2,
        event: r.3,
        status: r.4,
        timestamp: r.5,
        details: r.6,
    }).collect())
}

#[command]
pub async fn get_campaign_logs_with_info(
    state: State<'_, AppState>,
    campaign_id: Option<String>,
    limit: Option<i64>,
) -> Result<Vec<LogDataWithInfo>, String> {
    let pool = state.get_pool().await?;
    let limit_val = limit.unwrap_or(100);

    let query = match campaign_id {
        Some(_) => {
            "SELECT l.id, l.campaign_id, c.name, r.email, l.event, l.status, l.timestamp, l.details FROM logs l JOIN campaigns c ON l.campaign_id = c.id JOIN recipients r ON l.recipient_id = r.id WHERE l.campaign_id = ? ORDER BY l.timestamp DESC LIMIT ?"
        }
        None => {
            "SELECT l.id, l.campaign_id, c.name, r.email, l.event, l.status, l.timestamp, l.details FROM logs l JOIN campaigns c ON l.campaign_id = c.id JOIN recipients r ON l.recipient_id = r.id ORDER BY l.timestamp DESC LIMIT ?"
        }
    };

    let rows: Vec<(String, String, String, String, String, String, String, Option<String>)> = if let Some(cid) = campaign_id {
        sqlx::query_as(query)
            .bind(&cid)
            .bind(limit_val)
            .fetch_all(&pool)
            .await
            .map_err(|e| format!("Failed to fetch logs: {}", e))?
    } else {
        sqlx::query_as(query)
            .bind(limit_val)
            .fetch_all(&pool)
            .await
            .map_err(|e| format!("Failed to fetch logs: {}", e))?
    };

    Ok(rows.into_iter().map(|r| LogDataWithInfo {
        id: r.0,
        campaign_id: r.1,
        campaign_name: r.2,
        recipient_email: r.3,
        event: r.4,
        status: r.5,
        timestamp: r.6,
        details: r.7,
    }).collect())
}

#[command]
pub async fn export_logs_csv(
    state: State<'_, AppState>,
    campaign_id: Option<String>,
) -> Result<String, String> {
    let logs = get_campaign_logs(state, campaign_id).await?;

    let mut wtr = csv::Writer::from_writer(vec![]);
    wtr.write_record(&["id", "campaign_id", "recipient_id", "event", "status", "timestamp", "details"])
        .map_err(|e| format!("Failed to write CSV header: {}", e))?;

    for log in &logs {
        wtr.write_record(&[
            &log.id,
            &log.campaign_id,
            &log.recipient_id,
            &log.event,
            &log.status,
            &log.timestamp,
            log.details.as_deref().unwrap_or(""),
        ])
        .map_err(|e| format!("Failed to write CSV record: {}", e))?;
    }

    let data = String::from_utf8(wtr.into_inner().map_err(|e| format!("Failed to finalize CSV: {}", e))?)
        .map_err(|e| format!("Failed to convert CSV to string: {}", e))?;

    Ok(data)
}

#[command]
pub async fn get_dashboard_stats(
    state: State<'_, AppState>,
) -> Result<DashboardStats, String> {
    let pool = state.get_pool().await?;

    let sent_stats: (i64,) = sqlx::query_as(
        "SELECT COALESCE(SUM(sent_count), 0) FROM campaigns"
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| format!("Failed to get sent stats: {}", e))?;

    let total_recipients: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM recipients WHERE status = 'active'"
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| format!("Failed to count recipients: {}", e))?;

    let active: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM campaigns WHERE status = 'running' OR status = 'paused'"
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| format!("Failed to get active campaigns: {}", e))?;

    let completed: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM campaigns WHERE status = 'completed'"
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| format!("Failed to get completed campaigns: {}", e))?;

    let total_target: (i64,) = sqlx::query_as(
        "SELECT COALESCE(SUM(total_count), 0) FROM campaigns"
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| format!("Failed to get total target: {}", e))?;

    let delivery_rate = if total_target.0 > 0 {
        (sent_stats.0 as f64 / total_target.0 as f64) * 100.0
    } else {
        0.0
    };

    Ok(DashboardStats {
        total_sent: sent_stats.0,
        total_recipients: total_recipients.0,
        active_campaigns: active.0,
        completed_campaigns: completed.0,
        delivery_rate,
    })
}
