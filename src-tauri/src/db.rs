use tauri::{AppHandle, Manager};
use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};
use once_cell::sync::OnceCell;

static DB_POOL: OnceCell<SqlitePool> = OnceCell::new();

pub async fn init_db(app_handle: &AppHandle) {
    // Get the app‑data directory path via the AppHandle
    let app_data_dir : std::path::PathBuf = app_handle.path().app_data_dir()
        .expect("Failed to get app data directory");

    std::fs::create_dir_all(&app_data_dir)
        .expect("Failed to create app data dir");


    let db_path = app_data_dir.join("timer.db");
    println!("Opening DB at {}", db_path.display());
    let db_url = format!("sqlite:{}", db_path.to_string_lossy());

    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .expect("Failed to connect to DB");

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS pomodoro_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_type TEXT NOT NULL,
            duration_seconds INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(&pool)
    .await
    .expect("Failed to create table");

    DB_POOL.set(pool).expect("DB already initialized");
}

pub fn get_pool() -> &'static SqlitePool {
    DB_POOL.get().expect("DB not initialized")
}

