//// src-tauri/lib.rs

// src-tauri/lib.rs

//
// // Entry point function
// #[cfg_attr(mobile, tauri::mobile_entry_point)]
// pub fn run() {
//     tauri::Builder::default()
//         .plugin(tauri_plugin_notification::init())
//         .plugin(tauri_plugin_opener::init())
//         .plugin(tauri_plugin_sql::Builder::default().build())
//         .invoke_handler(tauri::generate_handler![
//             total_durations,
//             mean_durations
//         ])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }
// //
// //
// //
// //
// // use serde::Deserialize;
// //
// // #[derive(Debug, Deserialize)]
// // pub struct PomodoroSession {
// //     pub session_type: String,
// //     pub duration_minutes: i32,
// //     pub timestamp: String,
// // }
// //
// // #[tauri::command]
// // pub fn total_durations(sessions: Vec<PomodoroSession>) -> i32 {
// //     sessions
// //         .iter()
// //         .filter(|s| s.session_type == "work")
// //         .map(|s| s.duration_minutes)
// //         .sum()
// // }
// //
// // #[tauri::command]
// // pub fn mean_durations(sessions: Vec<PomodoroSession>) -> i32 {
// //     let work_sessions: Vec<_> = sessions
// //         .iter()
// //         .filter(|s| s.session_type == "work")
// //         .collect();
// //
// //     if work_sessions.is_empty() { return 0; }
// //     work_sessions.iter().map(|s| s.duration_minutes).sum::<i32>() / work_sessions.len() as i32
// // }
// //
// //
// //
// //
// // //
// // // use serde::Deserialize;
// // // //
// // // // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// // // //
// // //
// // // #[derive(Debug, Deserialize)]
// // // pub struct PomodoroSession {
// // //     session_type : String,
// // //     duration_minutes : i32,
// // //     timestamp: String,
// // // }
// // //
// // // #[tauri::command]
// // // pub fn total_durations(sessions: Vec<PomodoroSession>) -> i32 {
// // //     let total_hour : i32 = sessions
// // //         .iter()
// // //         .filter(|s| s.session_type == "work")
// // //         .map(|s| s.duration_minutes)
// // //         .sum();
// // //     total_hour.to_be()
// // // }
// // //
// // //
// // // #[tauri::command]
// // // pub fn mean_durations(sessions: Vec<PomodoroSession>) -> i32 {
// // //     let work_sessions: Vec<_> = sessions
// // //         .iter()
// // //         .filter(|s| s.session_type == "work")
// // //         .collect();
// // //
// // //     if work_sessions.is_empty() {
// // //         return 0;
// // //     }
// // //
// // //     let total_hour : i32= work_sessions
// // //         .iter()
// // //         .map(|s| s.duration_minutes)
// // //         .sum();
// // //     total_hour / (work_sessions.len() as i32)
// // // }

