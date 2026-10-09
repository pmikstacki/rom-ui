import { createAppSession, type StudioAuthProfile } from "rom-studio/application";

/** Use ROM's shared session composition; the host retains policy and storage. */
export function createRomConnection(base: string, bootstrap: { profile: StudioAuthProfile; close(): void }) {
  const session = createAppSession({ base, profile: bootstrap.profile });
  let disposed = false;
  return {
    application: session.controller,
    session: session.lifecycle,
    providers: session.providers,
    loginUrl: session.loginUrl,
    connect: session.refresh,
    logout: session.logout,
    dispose() {
      if (disposed) return;
      disposed = true;
      session.destroy();
      bootstrap.close();
    },
  };
}
