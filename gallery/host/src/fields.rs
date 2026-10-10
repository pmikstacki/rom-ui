use rom::{Action, Resource, ResourceRef, Result};
use rom_fields::{
    Color, Date, DateTime, Decimal, Email, JsonDocument, Multiline, Time, UnitValue, Url,
};
use std::collections::BTreeMap;

#[derive(Clone, Resource)]
#[resource(name = "gallery-fields", label = "Rich fields", title_field = "name")]
pub struct Fields {
    pub owner: String,
    pub name: String,
    pub enabled: bool,
    pub count: u64,
    pub date: Date,
    pub time: Time,
    pub recorded_at: DateTime,
    pub color: Color,
    pub email: Email,
    pub website: Url,
    pub notes: Multiline,
    pub document: JsonDocument,
    pub decimal: Decimal,
    pub measurement: UnitValue,
    pub tags: Vec<String>,
    pub attributes: BTreeMap<String, String>,
    pub optional_note: Option<String>,
    pub sample: Option<ResourceRef<crate::Sample>>,
}
impl Fields {
    pub fn example(owner: &str, name: &str) -> Result<Self> {
        Ok(Self {
            owner: owner.into(),
            name: name.into(),
            enabled: false,
            count: 9_007_199_254_740_993,
            date: Date::new("2026-10-09")?,
            time: Time::new("09:30:00")?,
            recorded_at: DateTime::new("2026-10-09T09:30:00Z")?,
            color: Color::new("#6366f1")?,
            email: Email::new("gallery@example.com")?,
            website: Url::new("https://example.com/gallery")?,
            notes: Multiline::new("Edit these fields.\nSave through ROM.")?,
            document: JsonDocument::new(r#"{"sequence":9007199254740993,"enabled":false}"#)?,
            decimal: Decimal::new("12345678901234567890.123456789")?,
            measurement: UnitValue::new(Decimal::new("12.5")?, "kg")?,
            tags: vec!["Gallery".into()],
            attributes: BTreeMap::from([("source".into(), "ROM".into())]),
            optional_note: None,
            sample: None,
        })
    }
}
pub const MEASURE: Action<Fields, UnitValue> = Action::new("measure", |resource, value| {
    resource.measurement = value;
    Ok(vec![])
});
