use crate::{Visitor, bootstrap_actor, build_host_runtime, provision};
use rom::Storage;
use rom_studio_host::{BrowserStore, HostConfig, OidcProviderConfig, StudioBootstrap, StudioHost};
use serde::Deserialize;
use std::{
    fs::File,
    io::Read,
    net::SocketAddr,
    path::{Path, PathBuf},
    sync::Arc,
};

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Configuration {
    pub origin: String,
    pub base: String,
    pub listen: SocketAddr,
    pub assets: PathBuf,
    pub database: PathBuf,
    pub provider: Provider,
    pub visitors: Vec<Visitor>,
    #[serde(default)]
    pub allow_loopback_http: bool,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Provider {
    issuer: String,
    client_id: String,
    authorization_endpoint: String,
    token_endpoint: String,
    jwks_endpoint: String,
    secret_file: Option<PathBuf>,
}
fn read_bounded(path: &Path, limit: u64) -> Result<String, &'static str> {
    let file = File::open(path).map_err(|_| "configuration file cannot be opened")?;
    read_file_bounded(file, limit)
}
fn read_file_bounded(file: File, limit: u64) -> Result<String, &'static str> {
    if !file
        .metadata()
        .map_err(|_| "configuration metadata unavailable")?
        .is_file()
    {
        return Err("configuration must be a regular file");
    }
    let mut text = String::new();
    file.take(limit + 1)
        .read_to_string(&mut text)
        .map_err(|_| "configuration file cannot be read")?;
    if text.len() as u64 > limit {
        return Err("configuration file exceeds its limit");
    }
    Ok(text)
}
pub fn read_configuration(path: &Path) -> Result<Configuration, &'static str> {
    serde_json::from_str(&read_bounded(path, 65_536)?)
        .map_err(|_| "invalid gallery host configuration")
}
fn secret(path: &Path) -> Result<String, &'static str> {
    use std::os::unix::fs::PermissionsExt;
    let file = File::open(path).map_err(|_| "credential file cannot be opened")?;
    let mode = file
        .metadata()
        .map_err(|_| "credential metadata unavailable")?
        .permissions()
        .mode();
    if mode & 0o077 != 0 {
        return Err("credential file must be private");
    }
    let value = read_file_bounded(file, 16_384)?;
    let value = value.trim_end_matches(['\r', '\n']).to_owned();
    if value.is_empty() {
        return Err("credential file is empty");
    }
    Ok(value)
}
pub async fn serve(config: Configuration) -> Result<(), Box<dyn std::error::Error>> {
    let storage = Arc::new(rom_sqlite::Sqlite::open(&config.database)?);
    let runtime = build_host_runtime(storage.clone())?;
    let approved = OidcProviderConfig {
        authority: "gallery-visitors".into(),
        label: "Gallery account".into(),
        issuer: config.provider.issuer.clone(),
        client_id: config.provider.client_id.clone(),
        authorization_endpoint: config.provider.authorization_endpoint,
        token_endpoint: config.provider.token_endpoint,
        jwks_endpoint: config.provider.jwks_endpoint,
        client_secret: config
            .provider
            .secret_file
            .as_deref()
            .map(secret)
            .transpose()?,
    };
    const PAYLOAD: usize = 1024 * 1024;
    let profile = StudioBootstrap::new(
        "gallery-visitors",
        "rom-ui-gallery-v1",
        storage.retry_epochs()?.current,
        PAYLOAD,
        BrowserStore::new("rom-ui-gallery-intents-v1", PAYLOAD + 4096, 128, 10_000)?,
        BrowserStore::new("rom-ui-gallery-editors-v1", PAYLOAD + 4096, 128, 10_000)?,
    )?;
    let host = StudioHost::new(
        runtime.clone(),
        HostConfig::new(
            &config.origin,
            &config.base,
            &config.assets,
            bootstrap_actor(),
        )
        .allow_loopback_http(config.allow_loopback_http)
        .provider(approved)
        .studio_profile(profile),
    )?;
    provision(
        &runtime,
        storage.as_ref(),
        &config.provider.issuer,
        &config.provider.client_id,
        &config.visitors,
    )
    .await?;
    let listener = tokio::net::TcpListener::bind(config.listen).await?;
    println!("Gallery ROM host ready");
    let mut terminate = tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())?;
    host.serve(listener, async move {
        tokio::select! {
            _ = tokio::signal::ctrl_c() => {},
            _ = terminate.recv() => {},
        }
    })
    .await?;
    Ok(())
}

#[cfg(test)]
#[path = "host_tests.rs"]
mod tests;
