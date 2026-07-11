pub mod smtp;
pub mod campaign;
pub mod recipients;
pub mod templates;
pub mod reports;

use tauri::command;

#[command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Lumina Velocity.", name)
}
