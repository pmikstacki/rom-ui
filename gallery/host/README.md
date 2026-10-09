# Gallery ROM host

This application serves gallery assets and session-bound ROM APIs through `rom-studio-host`. SQLite stores sample values and mutation receipts.

The host registers `gallery-samples`, `gallery-fields`, `gallery-tasks`, `gallery-workflows`, and private identity resources. Map resources remain pending.

## Build and verify

Use Rust 1.99.0. Set `ROM_GALLERY_SOURCE` to the qualified ROM source directory, then run:

```sh
./gallery/host/check
```

The check compares ROM inputs with `source/rom-inputs.json`. It runs formatting, ten host tests, Clippy, and a locked build.

The manifest has no machine-specific dependency paths. The check supplies Cargo source overrides for the selected ROM crates.

## Configure the host

Pass one configuration file to `rom-ui-gallery-host`. Unknown properties and configuration files larger than 65,536 bytes are rejected.

Required properties:

| Property | Value |
| --- | --- |
| `origin` | Approved external HTTPS origin |
| `base` | Gallery base path, usually `/` |
| `listen` | Internal socket address |
| `assets` | Built gallery asset directory |
| `database` | Persistent SQLite file path |
| `provider` | Approved OIDC provider configuration |
| `visitors` | Initial managed identity mappings |

The provider requires `issuer`, `client_id`, `authorization_endpoint`, `token_endpoint`, and `jwks_endpoint`. Optional `secret_file` names a private regular file.

Credential files must exclude group and other permissions. They must be nonempty and no larger than 16,384 bytes.

Each visitor mapping requires `id`, `subject`, and `label`. The subject is the approved provider's exact OIDC subject.

Provisioning preserves existing identity activation and sample values. Removing a mapping from this file does not revoke an existing identity.

Use ROM identity administration to change existing activation. The gallery does not expose identity administration resources or bootstrap authority.

`allow_loopback_http` defaults to false. Enable it only for a numeric loopback development fixture.

## Operation and evidence

Keep the database on persistent storage. The host drains through `StudioHost` on SIGINT or SIGTERM.

The host tests cover visitor isolation, owner-transfer rejection, stale revisions, receipt replay, SQLite reopening, and configuration admission.

The separate `gallery/tests/rom-host.spec.ts` journey uses a local synthetic OIDC provider. It checks exact integers, save/reload, unchanged saves, filtered discovery, and cross-visitor read denial in Chromium and WebKit.

Local fixture authentication does not establish production OIDC configuration. This host has not yet replaced the public static gallery container.
