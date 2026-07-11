pub mod smtp;
pub mod campaign;
pub mod recipients;
pub mod templates;
pub mod reports;
pub mod settings;
pub mod lists;
pub mod sending;

use tauri::command;

#[command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Velocity.", name)
}
