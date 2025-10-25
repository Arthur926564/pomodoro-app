// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{char::CharTryFromError, ptr::null};

use tauri_plugin_sql::{Builder as SqlPluginBuilder, Migration};
use chrono::{DateTime, Local, NaiveDateTime, TimeZone};
mod db;
mod session;

use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
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
    let sessions_clone = sessions.clone();
    let total_duration = total_durations(sessions);
    let total_session = total_sessions(sessions_clone);
    if total_session == 0 {
        return 0;
    } else {
        total_duration / total_session
    }
}

#[tauri::command]
fn total_sessions(sessions: Vec<PomodoroSession>) -> i32 {
    let work_sessions: Vec<_> = get_work_sessions(sessions);
    if work_sessions.is_empty() {return 0;}

    work_sessions.len() as i32
}


fn is_today(session: &PomodoroSession) -> bool {
    let current_date = Local::now().date_naive();
    if let Ok(naive_dt) = NaiveDateTime::parse_from_str(&session.timestamp, "%Y-%m-%d %H:%M:%S")  {
        let local_dt = Local.from_local_datetime(&naive_dt).unwrap();
        local_dt.date_naive() == current_date
    } else {
        false
    }
}

#[tauri::command]
fn total_hours_today(sessions: Vec<PomodoroSession>) -> i32 {
    let work_sessions: Vec<PomodoroSession> = get_work_sessions(sessions);
    let sum : i32 =  work_sessions 
        .iter()
        .filter(|s| is_today(s))
        .map(|s| s.duration_seconds)
        .sum();
    return sum as i32 / 60;
}


fn main() {
    tauri::Builder::default()
        .plugin(SqlPluginBuilder::default().build())
        .invoke_handler(tauri::generate_handler![
             total_durations,
             mean_durations,
             total_sessions,
             total_hours_today
         ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

