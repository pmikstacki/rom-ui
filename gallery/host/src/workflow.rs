use rom::{Action, Field, Resource, Result, Shape, Value};

#[derive(Clone, PartialEq)]
pub enum Stage {
    Design,
    Build,
    Share,
}
impl Field for Stage {
    fn shape() -> Shape {
        Shape::Enum(vec!["design".into(), "build".into(), "share".into()])
    }
    fn encode(&self) -> Value {
        match self {
            Self::Design => "design",
            Self::Build => "build",
            Self::Share => "share",
        }
        .into()
    }
    fn decode(value: Value) -> Result<Self> {
        match value.as_str() {
            Some("design") => Ok(Self::Design),
            Some("build") => Ok(Self::Build),
            Some("share") => Ok(Self::Share),
            _ => Err(rom::Error::invalid(
                "stage",
                "declared workflow stage required",
            )),
        }
    }
}
#[derive(Clone, Resource)]
#[resource(name = "gallery-workflows", label = "Workflows", title_field = "name")]
pub struct Workflow {
    pub owner: String,
    pub name: String,
    pub selected: Stage,
}
impl Workflow {
    pub fn example(owner: &str, name: &str) -> Self {
        Self {
            owner: owner.into(),
            name: name.into(),
            selected: Stage::Design,
        }
    }
}
pub const SELECT: Action<Workflow, String> = Action::new("select", |workflow, stage| {
    workflow.selected = Stage::decode(Value::from(stage))?;
    Ok(vec![])
});
