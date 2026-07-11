use lettre::transport::smtp::authentication::Credentials;
use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct SmtpStatus {
    pub connected: bool,
    pub message: String,
}

#[command]
pub async fn test_smtp_connection(
    email: String,
    password: String,
    host: String,
    port: u16,
) -> Result<SmtpStatus, String> {
    let creds = Credentials::new(email.clone(), password);

    let transport = match port {
        465 => {
            AsyncSmtpTransport::<Tokio1Executor>::relay(&host)
                .map_err(|e| format!("Failed to create relay: {}", e))?
                .credentials(creds)
                .port(port)
                .build()
        }
        _ => {
            AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&host)
                .map_err(|e| format!("Failed to create STARTTLS relay: {}", e))?
                .credentials(creds)
                .port(port)
                .build()
        }
    };

    // Send a test message to verify connection
    let test_email = Message::builder()
        .from(format!("Lumina Velocity <{}>", email).parse().map_err(|e| format!("Invalid from address: {}", e))?)
        .to("test@localhost".parse().map_err(|e| format!("Invalid to address: {}", e))?)
        .subject("Lumina Velocity - SMTP Test")
        .body("This is a test email to verify your SMTP connection.".to_string())
        .map_err(|e| format!("Failed to build message: {}", e))?;

    match transport.send(test_email).await {
        Ok(_) => Ok(SmtpStatus {
            connected: true,
            message: format!("Successfully connected to {}:{} as {}", host, port, email),
        }),
        Err(e) => {
            // Connection might fail for test purposes, but if we can reach the server, that's good enough
            let err_str = e.to_string();
            if err_str.contains("550") || err_str.contains("553") || err_str.contains("rejected") {
                // Server is reachable but rejected the test message - this is expected
                Ok(SmtpStatus {
                    connected: true,
                    message: format!("Connected to {}:{} as {}. Server is reachable.", host, port, email),
                })
            } else {
                Err(format!("SMTP connection failed: {}", e))
            }
        }
    }
}

#[command]
pub async fn connect_smtp(
    email: String,
    password: String,
    host: String,
    port: u16,
) -> Result<SmtpStatus, String> {
    test_smtp_connection(email, password, host, port).await
}

#[command]
pub async fn disconnect_smtp() -> Result<SmtpStatus, String> {
    Ok(SmtpStatus {
        connected: false,
        message: "Disconnected from SMTP server".to_string(),
    })
}
