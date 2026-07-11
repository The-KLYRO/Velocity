use sqlx::sqlite::SqlitePool;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::database::migrations;

pub struct AppState {
    pub db: Arc<Mutex<Option<SqlitePool>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            db: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn init_db(&self) -> Result<(), sqlx::Error> {
        let db_path = dirs::data_local_dir()
            .unwrap_or_else(|| std::path::PathBuf::from("."))
            .join("velocity")
            .join("lumina.db");

        std::fs::create_dir_all(db_path.parent().unwrap()).ok();

        let db_url = format!("sqlite:{}?mode=rwc", db_path.display());
        let pool = SqlitePool::connect(&db_url).await?;

        migrations::run_migrations(&pool).await?;

        let mut db = self.db.lock().await;
        *db = Some(pool);

        Ok(())
    }

    pub async fn get_pool(&self) -> Result<SqlitePool, String> {
        let db = self.db.lock().await;
        db.clone().ok_or_else(|| "Database not initialized".to_string())
    }
}
