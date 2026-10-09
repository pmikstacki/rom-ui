use crate::{
    build_runtime,
    workflow::{SELECT, Stage, Workflow},
};
use rom::{Actor, Command, Error, Field, Value};
use std::sync::Arc;

#[tokio::test]
async fn workflow_selection_rejects_invalid_and_foreign_commands_and_replays_exactly() {
    for (stage, wire) in [
        (Stage::Design, "design"),
        (Stage::Build, "build"),
        (Stage::Share, "share"),
    ] {
        assert_eq!(stage.encode(), Value::from(wire));
        assert!(Stage::decode(Value::from(wire)).unwrap() == stage);
    }
    assert!(Stage::decode(Value::from("unknown")).is_err());
    assert!(Stage::decode(Value::Null).is_err());
    let runtime = build_runtime(Arc::new(rom_sqlite::Sqlite::open(":memory:").unwrap())).unwrap();
    let alice = Actor::trusted("gallery-visitors", "alice");
    let bob = Actor::trusted("gallery-visitors", "bob");
    runtime
        .execute(
            &alice,
            Command::create(
                "alice-workflow",
                Workflow::example("alice", "Alice's workflow"),
            )
            .idempotency("create-workflow"),
        )
        .await
        .unwrap();
    assert!(matches!(
        runtime.read::<Workflow>(&bob, "alice-workflow").await,
        Err(Error::Denied)
    ));
    assert!(matches!(
        runtime
            .execute(
                &bob,
                Command::action("alice-workflow", SELECT, "build".into())
                    .at_revision(1)
                    .idempotency("foreign-select")
            )
            .await,
        Err(Error::Denied)
    ));
    assert!(
        runtime
            .execute(
                &alice,
                Command::action("alice-workflow", SELECT, "unknown".into())
                    .at_revision(1)
                    .idempotency("invalid-select")
            )
            .await
            .is_err()
    );
    let unchanged = runtime
        .read::<Workflow>(&alice, "alice-workflow")
        .await
        .unwrap();
    assert_eq!(unchanged.revision, 1);
    assert!(unchanged.value.unwrap().selected == Stage::Design);
    let command = Command::action("alice-workflow", SELECT, "build".into())
        .at_revision(1)
        .idempotency("select-build");
    let accepted = runtime.execute(&alice, command.clone()).await.unwrap();
    let replay = runtime.execute(&alice, command).await.unwrap();
    assert_eq!(accepted.revision, 2);
    assert_eq!(replay.revision, accepted.revision);
    assert!(matches!(
        runtime
            .execute(
                &alice,
                Command::action("alice-workflow", SELECT, "share".into())
                    .at_revision(1)
                    .idempotency("select-build")
            )
            .await,
        Err(Error::IdentityMismatch)
    ));
    assert!(matches!(
        runtime
            .execute(
                &alice,
                Command::action("alice-workflow", SELECT, "share".into())
                    .at_revision(1)
                    .idempotency("stale-select")
            )
            .await,
        Err(Error::Conflict)
    ));
    assert!(
        runtime
            .read::<Workflow>(&alice, "alice-workflow")
            .await
            .unwrap()
            .value
            .unwrap()
            .selected
            == Stage::Build
    );
    runtime.shutdown().await.unwrap();
}
