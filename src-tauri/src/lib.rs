pub mod commands;
pub mod config;
pub mod crypto;
pub mod database;
pub mod errors;
pub mod models;
pub mod state;

use state::AppState;
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .setup(|app| {
            tracing_subscriber::fmt::init();
            let state = app.state::<AppState>();
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(async {
                state.init_db().await.expect("Failed to initialize database");
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::smtp::test_smtp_connection,
            commands::smtp::save_smtp_account,
            commands::smtp::get_smtp_accounts,
            commands::smtp::get_smtp_account_password,
            commands::smtp::delete_smtp_account,
            commands::smtp::update_smtp_connection_status,
            commands::campaign::create_campaign,
            commands::campaign::update_campaign,
            commands::campaign::get_campaigns,
            commands::campaign::delete_campaign,
            commands::campaign::create_broadcast,
            commands::campaign::get_broadcasts,
            commands::campaign::start_broadcast,
            commands::campaign::pause_broadcast,
            commands::campaign::resume_broadcast,
            commands::campaign::get_last_broadcast,
            commands::recipients::import_recipients_csv,
            commands::recipients::get_recipients,
            commands::recipients::search_recipients,
            commands::recipients::update_recipient_status,
            commands::recipients::delete_recipients,
            commands::recipients::add_recipient,
            commands::templates::create_template,
            commands::templates::update_template,
            commands::templates::delete_template,
            commands::templates::get_templates,
            commands::reports::get_campaign_logs,
            commands::reports::get_campaign_logs_with_info,
            commands::reports::export_logs_csv,
            commands::reports::get_dashboard_stats,
            commands::settings::get_all_settings,
            commands::settings::get_setting,
            commands::settings::upsert_setting,
            commands::settings::upsert_settings_batch,
            commands::settings::delete_setting,
            commands::lists::create_recipient_list,
            commands::lists::get_recipient_lists,
            commands::lists::delete_recipient_list,
            commands::lists::rename_recipient_list,
            commands::lists::add_recipients_to_list,
            commands::lists::remove_recipients_from_list,
            commands::lists::get_list_recipients,
            commands::sending::send_email,
            commands::sending::send_broadcast,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
