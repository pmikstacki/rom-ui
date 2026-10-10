#[tokio::test]
async fn sending_is_owned_bounded_and_durably_replayable() {
    use crate::conversation::{Conversation, SEND};
    use rom::{Actor, Command, Error};
    let storage = std::sync::Arc::new(rom_sqlite::Sqlite::open(":memory:").unwrap());
    let runtime = crate::build_runtime(storage).unwrap();
    runtime
        .execute(
            &crate::bootstrap_actor(),
            Command::create(
                "alice-chat",
                Conversation::example("alice", "Alice's conversation"),
            )
            .idempotency("seed-chat"),
        )
        .await
        .unwrap();
    let alice = Actor::trusted("gallery-visitors", "alice");
    let bob = Actor::trusted("gallery-visitors", "bob");
    assert!(matches!(
        runtime.read::<Conversation>(&bob, "alice-chat").await,
        Err(Error::Denied)
    ));
    assert!(matches!(
        runtime
            .execute(
                &bob,
                Command::action("alice-chat", SEND, "foreign".into())
                    .at_revision(1)
                    .idempotency("foreign-chat")
            )
            .await,
        Err(Error::Denied)
    ));
    for (index, content) in [" ".to_string(), "x".repeat(4001)].into_iter().enumerate() {
        assert!(
            runtime
                .execute(
                    &alice,
                    Command::action("alice-chat", SEND, content)
                        .at_revision(1)
                        .idempotency(&format!("invalid-chat-{index}"))
                )
                .await
                .is_err()
        );
    }
    let command = Command::action("alice-chat", SEND, "  Hello ROM  ".into())
        .at_revision(1)
        .idempotency("send-hello");
    assert_eq!(
        runtime
            .execute(&alice, command.clone())
            .await
            .unwrap()
            .revision,
        2
    );
    assert_eq!(runtime.execute(&alice, command).await.unwrap().revision, 2);
    let row = runtime
        .read::<Conversation>(&alice, "alice-chat")
        .await
        .unwrap();
    let conversation = row.value.unwrap();
    assert_eq!(conversation.messages.len(), 2);
    assert_eq!(conversation.messages[1].content, "Hello ROM");
    assert_eq!(conversation.messages[1].id, "message-1");
}
