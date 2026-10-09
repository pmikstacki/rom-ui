use crate::{
    Sample,
    fields::{Fields, MEASURE},
};
use rom::{Access, Actor, Builder, PrincipalKind, Resource, Result, Runtime, Storage};
use rom_identity::{IdentityGate, IdentityLink, IdentityProvider, User};
use std::sync::Arc;

pub fn bootstrap_actor() -> Actor {
    Actor::trusted("gallery-bootstrap", "configuration")
}
fn bootstrap(actor: &Actor) -> bool {
    actor.authority == "gallery-bootstrap"
        && actor.subject == "configuration"
        && actor.principal_kind() == PrincipalKind::Embedded
}
fn owned(actor: &Actor, _: Access, sample: &Sample) -> bool {
    bootstrap(actor) || (actor.authority == "gallery-visitors" && sample.owner == actor.subject)
}
fn gallery_builder() -> Builder {
    Runtime::builder()
        .resource(
            crate::conversation::Conversation::definition()
                .policy(|actor, _, conversation| {
                    bootstrap(actor)
                        || (actor.authority == "gallery-visitors"
                            && conversation.owner == actor.subject)
                })
                .field_policy(|actor, access, field, _| {
                    matches!(access, Access::Read)
                        || bootstrap(actor)
                        || matches!(field, "name" | "messages")
                })
                .validate_transition(|actor, before, after| {
                    if bootstrap(actor) {
                        if let Some(conversation) = after {
                            conversation.validate()?;
                        }
                        return Ok(());
                    }
                    let (Some(before), Some(after)) = (before, after) else {
                        return Err(rom::Error::Denied);
                    };
                    after.validate_append(before)
                })
                .action(crate::conversation::SEND)
                .discovery_policy(|actor, _| actor.authority == "gallery-visitors"),
        )
        .resource(
            crate::map_scene::MapScene::definition()
                .policy(|actor, _, scene| {
                    bootstrap(actor)
                        || (actor.authority == "gallery-visitors" && scene.owner == actor.subject)
                })
                .field_policy(|actor, access, field, _| {
                    matches!(access, Access::Read)
                        || bootstrap(actor)
                        || matches!(field, "name" | "selected")
                })
                .validate_transition(|_, _, after| {
                    if let Some(scene) = after {
                        scene.validate_selection()?;
                    }
                    Ok(())
                })
                .action(crate::map_scene::SELECT)
                .discovery_policy(|actor, _| actor.authority == "gallery-visitors"),
        )
        .resource(
            crate::workflow::Workflow::definition()
                .policy(|actor, _, workflow| {
                    bootstrap(actor)
                        || (actor.authority == "gallery-visitors"
                            && workflow.owner == actor.subject)
                })
                .allow_all_fields()
                .action(crate::workflow::SELECT)
                .discovery_policy(|actor, _| actor.authority == "gallery-visitors"),
        )
        .resource(
            crate::tasks::Task::definition()
                .policy(|actor, _, task| {
                    bootstrap(actor)
                        || (actor.authority == "gallery-visitors" && task.owner == actor.subject)
                })
                .allow_all_fields()
                .action(crate::tasks::CANCEL)
                .action(crate::tasks::RETRY)
                .discovery_policy(|actor, _| actor.authority == "gallery-visitors"),
        )
        .resource(
            Fields::definition()
                .policy(|actor, _, fields| {
                    bootstrap(actor)
                        || (actor.authority == "gallery-visitors" && fields.owner == actor.subject)
                })
                .allow_all_fields()
                .action(MEASURE)
                .discovery_policy(|actor, _| actor.authority == "gallery-visitors"),
        )
        .resource(
            Sample::definition()
                .policy(owned)
                .allow_all_fields()
                .discovery_policy(|actor, _| actor.authority == "gallery-visitors"),
        )
}
#[cfg(test)]
pub fn build_runtime(storage: Arc<dyn Storage>) -> Result<Runtime> {
    gallery_builder().build(storage, Runtime::shared_cpu_pool(2)?)
}
pub fn build_host_runtime(storage: Arc<dyn Storage>) -> Result<Runtime> {
    let gate = IdentityGate::default().allow_host(
        "gallery-bootstrap",
        PrincipalKind::Embedded,
        "configuration",
    )?;
    gallery_builder()
        .actor_gate(Arc::new(gate))
        .resource(
            User::definition()
                .policy(|actor, _, _| bootstrap(actor))
                .allow_all_fields()
                .discovery_policy(|_, _| false),
        )
        .resource(
            IdentityProvider::definition()
                .policy(|actor, _, _| bootstrap(actor))
                .allow_all_fields()
                .discovery_policy(|_, _| false),
        )
        .resource(
            IdentityLink::definition()
                .policy(|actor, _, _| bootstrap(actor))
                .allow_all_fields()
                .discovery_policy(|_, _| false),
        )
        .build(storage, Runtime::shared_cpu_pool(2)?)
}
