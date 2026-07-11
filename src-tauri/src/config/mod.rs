use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub app_name: String,
    pub version: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            app_name: "Velocity".to_string(),
            version: "0.1.0".to_string(),
        }
    }
}
