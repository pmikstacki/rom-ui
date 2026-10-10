use rom_configured_maps::ConfiguredStyle;
use rom_map_core::{Attribution, BrowserPolicy, Cancellation, RequestContext, Styles};
use std::time::Duration;

pub async fn gallery_style() -> rom::Result<rom_fields::JsonDocument> {
    let invalid = |_| rom::Error::invalid("map-style", "approved provider style required");
    let policy = BrowserPolicy::new(&[
        "https://tile.openstreetmap.org",
        "https://tiles.openfreemap.org",
    ])
    .map_err(invalid)?;
    let credit = Attribution::new(
        "© OpenStreetMap contributors",
        Some("https://www.openstreetmap.org/copyright"),
    )
    .map_err(invalid)?;
    let provider = ConfiguredStyle::new(
        br#"{"version":8,"sources":{"streets":{"type":"raster","tiles":["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],"tileSize":256,"maxzoom":19}},"layers":[{"id":"streets","type":"raster","source":"streets"}]}"#,
        policy,
        vec![credit],
        vec![],
    )
    .map_err(invalid)?;
    let context =
        RequestContext::new(Duration::from_secs(1), Cancellation::new()).map_err(invalid)?;
    let style = provider.style(&context).await.map_err(invalid)?;
    rom_fields::JsonDocument::new(style.to_browser_json().to_string())
}
