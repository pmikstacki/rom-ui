use rom::{Action, CodecIdentity, Field, Resource, Result, Shape, Value};
use serde::{Deserialize, Serialize};

#[derive(Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Message {
    pub id: String,
    pub role: String,
    pub content: String,
}
impl Message {
    fn validate(&self) -> Result<()> {
        if !matches!(self.role.as_str(), "user" | "assistant")
            || self.id.is_empty()
            || self.id.len() > 64
            || self.content.trim().is_empty()
            || self.content.encode_utf16().count() > 4000
        {
            return Err(invalid());
        }
        Ok(())
    }
}
impl Field for Message {
    fn shape() -> Shape {
        Shape::Map(Box::new(Shape::String))
    }
    fn codec_identity() -> Option<CodecIdentity> {
        Some(CodecIdentity {
            name: "gallery.chat-message".into(),
            version: 1,
        })
    }
    fn encode(&self) -> Value {
        serde_json::json!({"id": self.id, "role": self.role, "content": self.content})
    }
    fn decode(value: Value) -> Result<Self> {
        let message: Self = serde_json::from_value(value).map_err(|_| invalid())?;
        message.validate()?;
        Ok(message)
    }
}
#[derive(Clone, Resource)]
#[resource(
    name = "gallery-conversations",
    label = "Conversations",
    title_field = "name"
)]
pub struct Conversation {
    pub owner: String,
    pub name: String,
    pub messages: Vec<Message>,
}
impl Conversation {
    pub fn example(owner: &str, name: &str) -> Self {
        Self {
            owner: owner.into(), name: name.into(),
            messages: vec![Message { id: "message-0".into(), role: "assistant".into(),
                content: "This conversation is stored in ROM. Messages are persisted, but this demo does not invoke an AI model.".into() }],
        }
    }
    pub fn validate(&self) -> Result<()> {
        if self.messages.len() > 128 {
            return Err(rom::Error::TooLarge);
        }
        for (index, message) in self.messages.iter().enumerate() {
            message.validate()?;
            if message.id != format!("message-{index}") {
                return Err(invalid());
            }
        }
        Ok(())
    }
    pub fn validate_append(&self, previous: &Self) -> Result<()> {
        self.validate()?;
        if self.messages == previous.messages {
            return Ok(());
        }
        if self.messages.len() != previous.messages.len() + 1
            || !self.messages.starts_with(&previous.messages)
            || self
                .messages
                .last()
                .is_none_or(|message| message.role != "user")
        {
            return Err(invalid());
        }
        Ok(())
    }
}
fn invalid() -> rom::Error {
    rom::Error::invalid("chat-message", "bounded append-only conversation required")
}
pub const SEND: Action<Conversation, String> = Action::new("send", |conversation, content| {
    if content.encode_utf16().count() > 4000 {
        return Err(invalid());
    }
    if conversation.messages.len() >= 128 {
        return Err(rom::Error::TooLarge);
    }
    let message = Message {
        id: format!("message-{}", conversation.messages.len()),
        role: "user".into(),
        content: content.trim().into(),
    };
    message.validate()?;
    conversation.messages.push(message);
    Ok(vec![])
});
