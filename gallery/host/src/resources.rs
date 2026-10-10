use rom::Resource;

#[derive(Clone, Resource)]
#[resource(
    name = "gallery-samples",
    label = "Gallery samples",
    title_field = "name"
)]
pub struct Sample {
    pub owner: String,
    pub name: String,
    pub count: u64,
}
