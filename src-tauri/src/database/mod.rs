use sqlx::sqlite::SqlitePool;

pub async fn create_pool(database_path: &str) -> Result<SqlitePool, sqlx::Error> {
    let pool = SqlitePool::connect(database_path).await?;
    Ok(pool)
}
