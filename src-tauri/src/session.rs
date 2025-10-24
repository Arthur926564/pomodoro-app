use sqlx::SqlitePool;

#[derive(serde::Deserialize)]
#[serde(rename_all = "lowercase")]

pub enum SessionType {
    Work,
    Break,
}

impl std::fmt::Display for SessionType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            SessionType::Work => "work",
            SessionType::Break => "break",
        };
        write!(f, "{}", s)
    }
}


#[tauri::command]
pub async fn save_session(
    session_type: SessionType,
    duration_second: i64,
) -> Result<(), String> {
    let pool: &SqlitePool = crate::db::get_pool();
    sqlx::query(
        "INSERT INTO pomodoro_sessions (session_type, duration_second) VALUES (?, ?)",
    )
    .bind(session_type.to_string())
    .bind(duration_second)
    .execute(pool)
    .await.map_err(|e| e.to_string())?;

    Ok(())
}
