#[tokio::test]
async fn provider_style_discloses_only_approved_tiles_and_visible_credit() {
    let document = super::map_provider::gallery_style().await.unwrap();
    let value: serde_json::Value = serde_json::from_str(document.as_str()).unwrap();
    assert_eq!(
        value["approvedOrigins"],
        serde_json::json!([
            "https://tile.openstreetmap.org",
            "https://tiles.openfreemap.org"
        ])
    );
    assert_eq!(
        value["style"]["sources"]["streets"]["tiles"][0],
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    );
    assert!(value["style"]["sources"]["streets"].get("url").is_none());
    assert_eq!(value["credits"][0]["text"], "© OpenStreetMap contributors");
}

#[tokio::test]
async fn map_selection_is_owned_validated_and_replayable() {
    use crate::map_scene::{MapScene, SELECT};
    use rom::{Actor, Command, Error};
    let runtime = crate::build_runtime(std::sync::Arc::new(
        rom_sqlite::Sqlite::open(":memory:").unwrap(),
    ))
    .unwrap();
    runtime
        .execute(
            &crate::bootstrap_actor(),
            Command::create(
                "alice-map",
                MapScene::example("alice", "Alice's map").await.unwrap(),
            )
            .idempotency("seed-map"),
        )
        .await
        .unwrap();
    let alice = Actor::trusted("gallery-visitors", "alice");
    let bob = Actor::trusted("gallery-visitors", "bob");
    assert!(matches!(
        runtime.read::<MapScene>(&bob, "alice-map").await,
        Err(Error::Denied)
    ));
    assert!(matches!(
        runtime
            .execute(
                &bob,
                Command::action("alice-map", SELECT, "wawel".into())
                    .at_revision(1)
                    .idempotency("foreign-map")
            )
            .await,
        Err(Error::Denied)
    ));
    assert!(
        runtime
            .execute(
                &alice,
                Command::action("alice-map", SELECT, "absent".into())
                    .at_revision(1)
                    .idempotency("invalid-map")
            )
            .await
            .is_err()
    );
    let unchanged = runtime.read::<MapScene>(&alice, "alice-map").await.unwrap();
    assert_eq!(unchanged.revision, 1);
    assert_eq!(unchanged.value.unwrap().selected, None);
    let command = Command::action("alice-map", SELECT, "wawel".into())
        .at_revision(1)
        .idempotency("select-wawel");
    let accepted = runtime.execute(&alice, command.clone()).await.unwrap();
    assert_eq!(accepted.revision, 2);
    assert_eq!(runtime.execute(&alice, command).await.unwrap().revision, 2);
    assert_eq!(
        runtime
            .read::<MapScene>(&alice, "alice-map")
            .await
            .unwrap()
            .value
            .unwrap()
            .selected
            .as_deref(),
        Some("wawel")
    );
    for (index, patch) in [
        rom::Patch::new().set(MapScene::owner_field(), "bob".into()),
        rom::Patch::new().set(
            MapScene::points_field(),
            rom_fields::JsonDocument::new("[]").unwrap(),
        ),
        rom::Patch::new().set(
            MapScene::style_field(),
            rom_fields::JsonDocument::new("{}").unwrap(),
        ),
    ]
    .into_iter()
    .enumerate()
    {
        assert!(matches!(
            runtime
                .execute(
                    &alice,
                    Command::patch("alice-map", patch)
                        .at_revision(2)
                        .idempotency(&format!("protected-{index}"))
                )
                .await,
            Err(Error::Denied)
        ));
    }
    assert!(
        runtime
            .execute(
                &alice,
                Command::patch(
                    "alice-map",
                    rom::Patch::new().set(MapScene::selected_field(), Some("absent".into()))
                )
                .at_revision(2)
                .idempotency("invalid-selected-patch")
            )
            .await
            .is_err()
    );
    let unchanged = runtime.read::<MapScene>(&alice, "alice-map").await.unwrap();
    assert_eq!(unchanged.revision, 2);
    assert_eq!(unchanged.value.unwrap().selected.as_deref(), Some("wawel"));
}
