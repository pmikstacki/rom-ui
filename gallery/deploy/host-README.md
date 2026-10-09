# Deploy the ROM gallery host

The existing `compose.yaml` serves the static gallery. Use `host-compose.yaml` for the ROM host after production configuration is verified.

## Prepare the image

Build and verify the host with `gallery/host/check`. Build the gallery from its frozen pnpm lockfile.

Prepare a new image context from the verified binary and assets:

```sh
node gallery/deploy/prepare-host-image.mjs /absolute/path/to/rom-ui-gallery-host gallery/dist /absolute/path/to/new-context
docker build -t rom-ui-gallery-host:<revision> /absolute/path/to/new-context
```

The current preparer supports the Nix-linked Linux binary. It copies required shared libraries and the system CA certificate bundle.

The context includes runtime input hashes. Keep the context and build log with the release evidence.

## Configure persistent storage

Create separate configuration and data directories. The container runs as UID and GID 10001.

Give that account access to the configuration files and write access to the data directory. Keep credential files private.

Set these environment variables:

| Variable | Value |
| --- | --- |
| `ROM_UI_GALLERY_HOST_IMAGE` | Verified image tag or digest |
| `ROM_UI_GALLERY_CONFIG` | Approved configuration directory |
| `ROM_UI_GALLERY_DATA` | Persistent data directory |

Mount `host.json` and any credential file in the configuration directory. See [host configuration](../host/README.md).

Use origin `https://romui.cybernomad.it`, base `/`, listen `0.0.0.0:8080`, assets `/gallery/assets`, and database `/gallery/data/gallery.db`.

Disable `allow_loopback_http` in production. Configure the approved OIDC client callback for `/auth/callback/gallery-visitors` on the public origin.

## Deploy and verify

Preserve the previous image and release directory. The host configuration replaces the static service with the same container name.

```sh
docker compose --project-name rom-ui-gallery -f gallery/deploy/host-compose.yaml up -d
```

Verify HTTPS assets, sign-in, visitor isolation, a confirmed mutation, and persistence after restart. Keep secrets outside release archives.

The local image passed the authenticated rich-form journey in Chromium and WebKit. It ran with a read-only filesystem and exited cleanly on SIGTERM.

These local checks do not establish production OIDC configuration or public HTTPS acceptance. Public deployment remains pending.
