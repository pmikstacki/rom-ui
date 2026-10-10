use rom::{Action, Field, Resource, Result, Shape, Value};

#[derive(Clone, PartialEq)]
pub enum Status {
    Running,
    Canceled,
    Done,
}
impl Field for Status {
    fn shape() -> Shape {
        Shape::Enum(vec!["running".into(), "canceled".into(), "done".into()])
    }
    fn encode(&self) -> Value {
        match self {
            Self::Running => "running",
            Self::Canceled => "canceled",
            Self::Done => "done",
        }
        .into()
    }
    fn decode(value: Value) -> Result<Self> {
        match value.as_str() {
            Some("running") => Ok(Self::Running),
            Some("canceled") => Ok(Self::Canceled),
            Some("done") => Ok(Self::Done),
            _ => Err(rom::Error::invalid(
                "status",
                "declared task status required",
            )),
        }
    }
}
#[derive(Clone, Resource)]
#[resource(name = "gallery-tasks", label = "Agent tasks", title_field = "name")]
pub struct Task {
    pub owner: String,
    pub name: String,
    pub status: Status,
    pub detail: String,
}
impl Task {
    pub fn example(owner: &str) -> Self {
        Self { owner: owner.into(), name: "Inspect gallery resource".into(), status: Status::Running, detail: "Synthetic task. Progress and actions are persisted through ROM; no model is invoked.".into() }
    }
}
pub const CANCEL: Action<Task, ()> = Action::new("cancel", |task, ()| {
    if task.status != Status::Running {
        return Err(rom::Error::invalid(
            "status",
            "only running tasks can be canceled",
        ));
    }
    task.status = Status::Canceled;
    Ok(vec![])
});
pub const RETRY: Action<Task, ()> = Action::new("retry", |task, ()| {
    if task.status != Status::Canceled {
        return Err(rom::Error::invalid(
            "status",
            "only canceled tasks can be retried",
        ));
    }
    task.status = Status::Running;
    Ok(vec![])
});
