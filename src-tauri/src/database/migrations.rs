use sqlx::sqlite::SqlitePool;

pub async fn run_migrations(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS campaigns (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'draft',
            template_id TEXT,
            created_at TEXT NOT NULL,
            sent_count INTEGER NOT NULL DEFAULT 0,
            total_count INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS recipients (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            company TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            tags TEXT DEFAULT '[]',
            created_at TEXT NOT NULL,
            last_sent TEXT
        );

        CREATE TABLE IF NOT EXISTS templates (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            body_html TEXT NOT NULL,
            body_text TEXT,
            variables TEXT DEFAULT '[]',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS smtp_accounts (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            host TEXT NOT NULL,
            port INTEGER NOT NULL,
            encryption TEXT NOT NULL DEFAULT 'starttls',
            daily_limit INTEGER NOT NULL DEFAULT 500,
            delay_ms INTEGER NOT NULL DEFAULT 1000,
            retry_count INTEGER NOT NULL DEFAULT 3,
            is_connected INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS logs (
            id TEXT PRIMARY KEY,
            campaign_id TEXT NOT NULL,
            recipient_id TEXT NOT NULL,
            event TEXT NOT NULL,
            status TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            details TEXT,
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
            FOREIGN KEY (recipient_id) REFERENCES recipients(id)
        );

        CREATE TABLE IF NOT EXISTS settings (
            id TEXT PRIMARY KEY,
            key TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS queue (
            id TEXT PRIMARY KEY,
            campaign_id TEXT NOT NULL,
            recipient_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            attempts INTEGER NOT NULL DEFAULT 0,
            next_retry TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
            FOREIGN KEY (recipient_id) REFERENCES recipients(id)
        );

        CREATE TABLE IF NOT EXISTS recipient_lists (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS recipient_list_members (
            list_id TEXT NOT NULL,
            recipient_id TEXT NOT NULL,
            added_at TEXT NOT NULL,
            PRIMARY KEY (list_id, recipient_id),
            FOREIGN KEY (list_id) REFERENCES recipient_lists(id) ON DELETE CASCADE,
            FOREIGN KEY (recipient_id) REFERENCES recipients(id) ON DELETE CASCADE
        );
        "#,
    )
    .execute(pool)
    .await?;

    Ok(())
}
