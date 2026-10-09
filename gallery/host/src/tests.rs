use crate::{Sample, build_runtime};
use rom::{Actor, Command, Error};
use std::sync::Arc;

#[tokio::test]
async fn visitors_cannot_read_or_change_another_visitors_sample() {
    let storage = Arc::new(rom_sqlite::Sqlite::open(":memory:").unwrap());
    let runtime = build_runtime(storage).unwrap();
    let alice = Actor::trusted("gallery-visitors", "alice");
    let bob = Actor::trusted("gallery-visitors", "bob");
    runtime
        .execute(
            &alice,
            Command::create(
                "alice-sample",
                Sample {
                    owner: "alice".into(),
                    name: "Alice's sample".into(),
                    count: 9_007_199_254_740_993,
                },
            )
            .idempotency("alice-create"),
        )
        .await
        .unwrap();
    assert!(
        runtime
            .read::<Sample>(&alice, "alice-sample")
            .await
            .unwrap()
            .value
            .is_some()
    );
    assert!(matches!(
        runtime.read::<Sample>(&bob, "alice-sample").await,
        Err(Error::Denied)
    ));
    assert!(matches!(
        runtime
            .execute(
                &bob,
                Command::replace(
                    "alice-sample",
                    Sample {
                        owner: "bob".into(),
                        name: "Take over".into(),
                        count: 0,
                    }
                )
                .at_revision(1)
                .idempotency("bob-replace")
            )
            .await,
        Err(Error::Denied)
    ));
    let confirmed = runtime
        .read::<Sample>(&alice, "alice-sample")
        .await
        .unwrap();
    assert_eq!(confirmed.revision, 1);
    assert_eq!(confirmed.value.unwrap().name, "Alice's sample");
    runtime.shutdown().await.unwrap();
}

#[tokio::test]
async fn owner_changes_and_stale_writes_leave_the_confirmed_row_unchanged() {
    let storage = Arc::new(rom_sqlite::Sqlite::open(":memory:").unwrap());
    let runtime = build_runtime(storage).unwrap();
    let alice = Actor::trusted("gallery-visitors", "alice");
    let initial = Sample {
        owner: "alice".into(),
        name: "Original".into(),
        count: 9_007_199_254_740_993,
    };
    runtime
        .execute(
            &alice,
            Command::create("sample", initial.clone()).idempotency("create"),
        )
        .await
        .unwrap();
    let transfer = Sample {
        owner: "bob".into(),
        ..initial.clone()
    };
    assert!(matches!(
        runtime
            .execute(
                &alice,
                Command::replace("sample", transfer)
                    .at_revision(1)
                    .idempotency("transfer")
            )
            .await,
        Err(Error::Denied)
    ));
    let request = Command::replace(
        "sample",
        Sample {
            name: "Accepted".into(),
            ..initial.clone()
        },
    )
    .at_revision(1)
    .idempotency("accepted");
    let first = runtime.execute(&alice, request.clone()).await.unwrap();
    let replay = runtime.execute(&alice, request).await.unwrap();
    assert_eq!(first.revision, 2);
    assert_eq!(replay.revision, first.revision);
    assert!(matches!(
        runtime
            .execute(
                &alice,
                Command::replace("sample", initial)
                    .at_revision(1)
                    .idempotency("stale")
            )
            .await,
        Err(Error::Conflict)
    ));
    let confirmed = runtime.read::<Sample>(&alice, "sample").await.unwrap();
    assert_eq!(confirmed.revision, 2);
    let value = confirmed.value.unwrap();
    assert_eq!(value.name, "Accepted");
    assert_eq!(value.owner, "alice");
    assert_eq!(value.count, 9_007_199_254_740_993);
    runtime.shutdown().await.unwrap();
}

#[tokio::test]
async fn restart_retains_visitor_data_and_original_mutation_receipt() {
    let directory = tempfile::tempdir().unwrap();
    let path = directory.path().join("gallery.db");
    let alice = Actor::trusted("gallery-visitors", "alice");
    let initial = Sample {
        owner: "alice".into(),
        name: "Before restart".into(),
        count: 9_007_199_254_740_993,
    };
    let request = Command::replace(
        "sample",
        Sample {
            name: "Saved".into(),
            ..initial.clone()
        },
    )
    .at_revision(1)
    .idempotency("save");
    let runtime = build_runtime(Arc::new(rom_sqlite::Sqlite::open(&path).unwrap())).unwrap();
    runtime
        .execute(
            &alice,
            Command::create("sample", initial).idempotency("create"),
        )
        .await
        .unwrap();
    runtime.execute(&alice, request.clone()).await.unwrap();
    runtime.shutdown().await.unwrap();
    drop(runtime);
    let reopened = build_runtime(Arc::new(rom_sqlite::Sqlite::open(&path).unwrap())).unwrap();
    let confirmed = reopened.read::<Sample>(&alice, "sample").await.unwrap();
    assert_eq!(confirmed.revision, 2);
    assert_eq!(confirmed.value.unwrap().name, "Saved");
    let replay = reopened.execute(&alice, request).await.unwrap();
    assert_eq!(replay.revision, 2);
    assert_eq!(replay.value.unwrap().count, 9_007_199_254_740_993);
    reopened.shutdown().await.unwrap();
}

#[tokio::test]
async fn deployed_runtime_rejects_unestablished_visitor_identity() {
    let runtime =
        crate::build_host_runtime(Arc::new(rom_sqlite::Sqlite::open(":memory:").unwrap())).unwrap();
    let forged = Actor::trusted("gallery-visitors", "alice");
    assert!(matches!(
        runtime
            .execute(
                &forged,
                Command::create(
                    "sample",
                    Sample {
                        owner: "alice".into(),
                        name: "Unestablished".into(),
                        count: 0,
                    }
                )
                .idempotency("unestablished")
            )
            .await,
        Err(Error::Denied)
    ));
    runtime.shutdown().await.unwrap();
}

#[tokio::test]
async fn provisioning_preserves_saved_samples_and_keeps_identity_records_private() {
    let storage = Arc::new(rom_sqlite::Sqlite::open(":memory:").unwrap());
    let runtime = crate::build_host_runtime(storage.clone()).unwrap();
    let visitors = vec![crate::Visitor {
        id: "alice".into(),
        subject: "alice-subject".into(),
        label: "Alice".into(),
    }];
    crate::provision(
        &runtime,
        storage.as_ref(),
        "https://identity.example",
        "gallery",
        &visitors,
    )
    .await
    .unwrap();
    let bootstrap = crate::bootstrap_actor();
    let saved = Sample {
        owner: "alice-subject".into(),
        name: "Saved visitor sample".into(),
        count: 9_007_199_254_740_995,
    };
    runtime
        .execute(
            &bootstrap,
            Command::replace("alice-sample", saved)
                .at_revision(1)
                .idempotency("save"),
        )
        .await
        .unwrap();
    crate::provision(
        &runtime,
        storage.as_ref(),
        "https://identity.example",
        "gallery",
        &visitors,
    )
    .await
    .unwrap();
    let confirmed = runtime
        .read::<Sample>(&bootstrap, "alice-sample")
        .await
        .unwrap();
    assert_eq!(confirmed.revision, 2);
    assert_eq!(confirmed.value.unwrap().name, "Saved visitor sample");
    assert!(
        crate::provision(
            &runtime,
            storage.as_ref(),
            "https://other.example",
            "gallery",
            &visitors
        )
        .await
        .is_err()
    );
    runtime.shutdown().await.unwrap();
}

#[tokio::test]
async fn rich_fields_keep_exact_values_and_visitor_ownership() {
    use crate::fields::Fields;
    use rom::Field;
    let storage = Arc::new(rom_sqlite::Sqlite::open(":memory:").unwrap());
    let runtime = build_runtime(storage).unwrap();
    let alice = Actor::trusted("gallery-visitors", "alice");
    let bob = Actor::trusted("gallery-visitors", "bob");
    let fields = Fields::example("alice", "Alice's fields").unwrap();
    runtime
        .execute(
            &alice,
            Command::create("alice-fields", fields).idempotency("fields-create"),
        )
        .await
        .unwrap();
    let restored = runtime
        .read::<Fields>(&alice, "alice-fields")
        .await
        .unwrap()
        .value
        .unwrap();
    assert_eq!(
        restored.decimal.encode(),
        rom::Value::String("12345678901234567890.123456789".into())
    );
    assert_eq!(restored.count, 9_007_199_254_740_993);
    assert!(matches!(
        runtime.read::<Fields>(&bob, "alice-fields").await,
        Err(Error::Denied)
    ));
    runtime.shutdown().await.unwrap();
}

#[tokio::test]
async fn task_actions_preserve_ownership_and_original_revision() {
    use crate::tasks::{CANCEL, RETRY, Task};
    let storage = Arc::new(rom_sqlite::Sqlite::open(":memory:").unwrap());
    let runtime = build_runtime(storage).unwrap();
    let alice = Actor::trusted("gallery-visitors", "alice");
    let bob = Actor::trusted("gallery-visitors", "bob");
    runtime
        .execute(
            &alice,
            Command::create("alice-task", Task::example("alice")).idempotency("task-create"),
        )
        .await
        .unwrap();
    assert!(matches!(
        runtime
            .execute(
                &bob,
                Command::action("alice-task", CANCEL, ())
                    .at_revision(1)
                    .idempotency("bob-cancel")
            )
            .await,
        Err(Error::Denied)
    ));
    runtime
        .execute(
            &alice,
            Command::action("alice-task", CANCEL, ())
                .at_revision(1)
                .idempotency("alice-cancel"),
        )
        .await
        .unwrap();
    assert!(matches!(
        runtime
            .execute(
                &alice,
                Command::action("alice-task", RETRY, ())
                    .at_revision(1)
                    .idempotency("stale-retry")
            )
            .await,
        Err(Error::Conflict)
    ));
    runtime
        .execute(
            &alice,
            Command::action("alice-task", RETRY, ())
                .at_revision(2)
                .idempotency("alice-retry"),
        )
        .await
        .unwrap();
    runtime.shutdown().await.unwrap();
}
