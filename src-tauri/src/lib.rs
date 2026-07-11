pub mod commands;
pub mod config;
pub mod database;
pub mod errors;
pub mod models;
pub mod state;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            tracing_subscriber::fmt::init();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
