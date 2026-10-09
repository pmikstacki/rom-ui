# Gallery deployment

Build the gallery from its frozen pnpm lock before deploying.
Package only `dist` and `deploy` from the gallery directory.
Use a distinct release directory under `/opt/rom-ui-gallery/releases`.
Build an image with `docker build -f deploy/Dockerfile -t rom-ui-gallery:<revision> .`.
Set `ROM_UI_GALLERY_IMAGE` to that image in the deployment environment.
Run `docker compose --project-name rom-ui-gallery -f deploy/compose.yaml up -d`.

The container joins the existing `coolify` network.
Caddy Docker Proxy discovers the host labels and obtains the HTTPS certificate.
The deployment does not require changes to the shared proxy configuration.

Check `/healthz`, the gallery document and its asset URLs through public HTTPS.
Run the gallery tests with `ROM_GALLERY_URL=https://romui.cybernomad.it`.
A missing asset must return 404 rather than the gallery document.
Keep the previous release image and directory for rollback.
