use crate::{Sample, bootstrap_actor};
use rom::{Command, Error, Key, PrincipalKind, Resource, Result, Runtime, Storage};
use rom_identity::{IdentityLink, IdentityProvider, ProviderProfile, User, link_key};
use serde::Deserialize;
use std::collections::BTreeSet;

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Visitor {
    pub id: String,
    pub subject: String,
    pub label: String,
}
fn invalid() -> Error {
    Error::invalid("gallery-host", "provisioning")
}
fn key<R: Resource>(id: &str) -> Key {
    Key {
        kind: R::KIND.into(),
        id: id.into(),
    }
}
async fn seed<R: Resource>(
    runtime: &Runtime,
    storage: &dyn Storage,
    id: &str,
    value: R,
) -> Result<()> {
    if storage.load(&key::<R>(id))?.is_none() {
        runtime
            .execute(
                &bootstrap_actor(),
                Command::create(id, value).idempotency(&format!("gallery-seed-{}-{id}", R::KIND)),
            )
            .await?;
    }
    Ok(())
}
pub async fn provision(
    runtime: &Runtime,
    storage: &dyn Storage,
    issuer: &str,
    audience: &str,
    visitors: &[Visitor],
) -> Result<()> {
    let mut ids = BTreeSet::new();
    let mut subjects = BTreeSet::new();
    if visitors.len() > 128 {
        return Err(Error::TooLarge);
    }
    for visitor in visitors {
        if visitor.id.is_empty()
            || visitor.id.len() > 64
            || !visitor
                .id
                .bytes()
                .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-' || byte == b'_')
            || visitor.subject.is_empty()
            || visitor.subject.len() > 256
            || visitor.subject.chars().any(char::is_control)
            || visitor.label.is_empty()
            || visitor.label.len() > 256
            || !ids.insert(&visitor.id)
            || !subjects.insert(&visitor.subject)
        {
            return Err(invalid());
        }
    }
    if let Some(row) = storage.load(&key::<IdentityProvider>("gallery-visitors"))? {
        let provider = IdentityProvider::decode(row.value.ok_or_else(invalid)?)?;
        if provider.issuer != issuer || provider.audience != audience {
            return Err(invalid());
        }
    }
    seed(
        runtime,
        storage,
        "gallery-visitors",
        IdentityProvider {
            enabled: true,
            profile: ProviderProfile::OidcRs256Human,
            issuer: issuer.into(),
            audience: audience.into(),
            endpoint: None,
            credential_ref: None,
        },
    )
    .await?;
    for visitor in visitors {
        seed(
            runtime,
            storage,
            &visitor.id,
            User {
                enabled: true,
                display_name: visitor.label.clone(),
            },
        )
        .await?;
        let link = link_key("gallery-visitors", PrincipalKind::Human, &visitor.subject);
        if let Some(row) = storage.load(&key::<IdentityLink>(&link))? {
            let existing = IdentityLink::decode(row.value.ok_or_else(invalid)?)?;
            if existing.user_id != visitor.id {
                return Err(invalid());
            }
        }
        seed(
            runtime,
            storage,
            &link,
            IdentityLink {
                authority: "gallery-visitors".into(),
                subject: visitor.subject.clone(),
                principal_kind: "human".into(),
                user_id: visitor.id.clone(),
                enabled: true,
            },
        )
        .await?;
        let workflow_id = format!("{}-workflow", visitor.id);
        let conversation_id = format!("{}-chat", visitor.id);
        if let Some(row) =
            storage.load(&key::<crate::conversation::Conversation>(&conversation_id))?
            && let Some(value) = row.value
            && crate::conversation::Conversation::decode(value)?.owner != visitor.subject
        {
            return Err(invalid());
        }
        seed(
            runtime,
            storage,
            &conversation_id,
            crate::conversation::Conversation::example(
                &visitor.subject,
                &format!("{}'s conversation", visitor.label),
            ),
        )
        .await?;
        let map_id = format!("{}-map", visitor.id);
        if let Some(row) = storage.load(&key::<crate::map_scene::MapScene>(&map_id))?
            && let Some(value) = row.value
            && crate::map_scene::MapScene::decode(value)?.owner != visitor.subject
        {
            return Err(invalid());
        }
        seed(
            runtime,
            storage,
            &map_id,
            crate::map_scene::MapScene::example(
                &visitor.subject,
                &format!("{}'s map", visitor.label),
            )
            .await?,
        )
        .await?;
        if let Some(row) = storage.load(&key::<crate::workflow::Workflow>(&workflow_id))?
            && let Some(value) = row.value
            && crate::workflow::Workflow::decode(value)?.owner != visitor.subject
        {
            return Err(invalid());
        }
        seed(
            runtime,
            storage,
            &workflow_id,
            crate::workflow::Workflow::example(
                &visitor.subject,
                &format!("{}'s workflow", visitor.label),
            ),
        )
        .await?;
        let task_id = format!("{}-task", visitor.id);
        if let Some(row) = storage.load(&key::<crate::tasks::Task>(&task_id))?
            && let Some(value) = row.value
            && crate::tasks::Task::decode(value)?.owner != visitor.subject
        {
            return Err(invalid());
        }
        seed(
            runtime,
            storage,
            &task_id,
            crate::tasks::Task::example(&visitor.subject),
        )
        .await?;
        let fields_id = format!("{}-fields", visitor.id);
        if let Some(row) = storage.load(&key::<crate::fields::Fields>(&fields_id))?
            && let Some(value) = row.value
            && crate::fields::Fields::decode(value)?.owner != visitor.subject
        {
            return Err(invalid());
        }
        seed(
            runtime,
            storage,
            &fields_id,
            crate::fields::Fields::example(
                &visitor.subject,
                &format!("{}'s fields", visitor.label),
            )?,
        )
        .await?;
        let id = format!("{}-sample", visitor.id);
        if let Some(row) = storage.load(&key::<Sample>(&id))?
            && let Some(value) = row.value
            && Sample::decode(value)?.owner != visitor.subject
        {
            return Err(invalid());
        }
        seed(
            runtime,
            storage,
            &id,
            Sample {
                owner: visitor.subject.clone(),
                name: format!("{}'s sample", visitor.label),
                count: 9_007_199_254_740_993,
            },
        )
        .await?;
    }
    Ok(())
}
