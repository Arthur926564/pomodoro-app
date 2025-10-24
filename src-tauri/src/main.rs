// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_sql::{Builder as SqlPluginBuilder, Migration};
mod db;
mod session;

use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct PomodoroSession {
    pub session_type: String,
    pub duration_seconds: i32,
    pub timestamp: String,
}

fn get_work_sessions(sessions: Vec<PomodoroSession>) -> Vec<PomodoroSession> {
    sessions
        .into_iter()
        .filter( |s| s.session_type == "work")
        .collect()
}
// Commands
#[tauri::command]
fn total_durations(sessions: Vec<PomodoroSession>) -> i32 {
    let total_works : Vec<PomodoroSession> = get_work_sessions(sessions);
    let total_duration : i32 = total_works
        .iter()
        .map(|s| s.duration_seconds)
        .sum();
    total_duration / 60
}

#[tauri::command]
fn mean_durations(sessions: Vec<PomodoroSession>) -> i32 {
    let work_sessions: Vec<_> = get_work_sessions(sessions);
    if work_sessions.is_empty() { return 0;}
    work_sessions.iter().map(|s| s.duration_seconds).sum::<i32>() / (work_sessions.len() as i32 * 60)
}

#[tauri::command]
fn total_sessions(sessions: Vec<PomodoroSession>) -> i32 {
    let work_sessions: Vec<_> = get_work_sessions(sessions);
    if work_sessions.is_empty() {return 0;}

    work_sessions.len() as i32
}


fn main() {
    tauri::Builder::default()
        .plugin(SqlPluginBuilder::default().build())
        .invoke_handler(tauri::generate_handler![
             total_durations,
             mean_durations,
             total_sessions
         ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

