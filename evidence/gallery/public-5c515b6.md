# Gallery deployment 5c515b6

The dedicated image rom-ui-gallery:5c515b6 is running on 191.96.53.21 with a read-only root filesystem.
Image identity: sha256:7605c3413d2e641764e3556f4b76eddfcf7d38007805923d7ee53057fbd39ae6.
The release directory is /opt/rom-ui-gallery/releases/5c515b6.
The deployment archive SHA-256 is 3bf942d221079402003644b9f4769318a02d0c30e9a5663a0dabdae5e9b7646f.

Public HTTPS returned 200 for the gallery, healthz, favicon and licenses. A missing asset returned 404.
Chromium passed nineteen public browser cases. The initial WebKit run could not start HTTPS navigation because its GLib TLS module was absent.
After installing the matching NixOS glib-networking module, WebKit passed all nineteen cases through verified public HTTPS.
Set GIO_EXTRA_MODULES=/nix/store/pna9r6204grpyb4qsdfmdr9qjxsr6yhr-glib-networking-2.80.1/lib/gio/modules for this WebKit executable.
Certificate verification remained enabled. No ignoreHTTPSErrors option was used.

These records qualify the deployed Polish gallery and alpha.4 map implementation.
The subsequent English translation, component snippets, street basemap and Flex module require new qualification and deployment.
