use aes_gcm::{aead::Aead, Aes256Gcm, KeyInit, Nonce};
use aes_gcm::aead::OsRng;
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use sha2::{Sha256, Digest};

const APP_KEY: &[u8] = b"velocity-2024-secure-key!";

fn derive_key() -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(APP_KEY);
    let result = hasher.finalize();
    let mut key = [0u8; 32];
    key.copy_from_slice(&result);
    key
}

pub fn encrypt(plaintext: &str) -> String {
    let key = derive_key();
    let cipher = Aes256Gcm::new_from_slice(&key).expect("valid key");

    let mut nonce_bytes = [0u8; 12];
    use aes_gcm::aead::rand_core::RngCore;
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher.encrypt(nonce, plaintext.as_bytes()).expect("encryption failed");

    let mut output = nonce_bytes.to_vec();
    output.extend_from_slice(&ciphertext);
    BASE64.encode(&output)
}

pub fn decrypt(encoded: &str) -> Result<String, String> {
    let data = BASE64.decode(encoded).map_err(|e| format!("Invalid base64: {}", e))?;
    if data.len() < 12 {
        return Err("Invalid encrypted data".to_string());
    }

    let key = derive_key();
    let cipher = Aes256Gcm::new_from_slice(&key).map_err(|e| format!("Invalid key: {}", e))?;

    let nonce = Nonce::from_slice(&data[..12]);
    let ciphertext = &data[12..];

    let plaintext = cipher.decrypt(nonce, ciphertext).map_err(|e| format!("Decryption failed: {}", e))?;
    String::from_utf8(plaintext).map_err(|e| format!("Invalid UTF-8: {}", e))
}
