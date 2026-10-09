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
