use rom::{Action, Resource, Result};
use rom_fields::JsonDocument;

#[derive(Clone, Resource)]
#[resource(name = "gallery-maps", label = "Maps", title_field = "name")]
pub struct MapScene {
    pub owner: String,
    pub name: String,
    pub selected: Option<String>,
    pub points: JsonDocument,
    pub style: JsonDocument,
}
impl MapScene {
    pub fn validate_selection(&self) -> Result<()> {
        let Some(id) = self.selected.as_deref() else {
            return Ok(());
        };
        self.validate_point(id)
    }
    fn validate_point(&self, id: &str) -> Result<()> {
        let points: serde_json::Value = serde_json::from_str(self.points.as_str())
            .map_err(|_| rom::Error::invalid("map-points", "approved points required"))?;
        if points
            .as_array()
            .is_some_and(|points| points.iter().any(|point| point["id"].as_str() == Some(id)))
        {
            return Ok(());
        }
        Err(rom::Error::invalid(
            "map-selection",
            "declared point required",
        ))
    }
    pub async fn example(owner: &str, name: &str) -> Result<Self> {
        Ok(Self {
            owner: owner.into(),
            name: name.into(),
            selected: None,
            points: JsonDocument::new(
                r#"[{"id":"old-town","title":"Old Town","longitude":19.937,"latitude":50.061},{"id":"wawel","title":"Wawel Castle","longitude":19.935,"latitude":50.054},{"id":"kazimierz","title":"Kazimierz","longitude":19.945,"latitude":50.051}]"#,
            )?,
            style: crate::map_provider::gallery_style().await?,
        })
    }
}
pub const SELECT: Action<MapScene, String> = Action::new("select", |scene, id| {
    scene.validate_point(&id)?;
    scene.selected = Some(id);
    Ok(vec![])
});
