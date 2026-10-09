import { createApplication, type StudioAuthProfile } from "rom-studio/application";
import { createClient } from "rom-studio/client";
import { createBrowserSessionDriver, createSessionLifecycle, createBrowserAuth } from "rom-studio/auth";

/** Compose installed ROM session and recovery contracts; the host retains policy. */
export function createRomConnection(base: string, bootstrap: { profile: StudioAuthProfile; close(): void }) {
  const { profile } = bootstrap;
  const root = `${base.replace(/\/$/, "")}/`;
  const driver = createBrowserSessionDriver({ base: root, authority: profile.authority, now: profile.now });
  const newClient = () => createClient({ base: `${root}api`, csrf: driver.csrf });
  const application = createApplication(newClient(), undefined, undefined, { recovery: profile.recovery });
  const session = createSessionLifecycle({
    driver,
    now: profile.now,
    async onTransition(transition) {
      if (transition.kind === "transient") application.pauseSession("transient");
      else await application.rebindSession({ client: newClient(), principal: transition.next?.principal ?? null });
    },
  });
  const providerDiscovery = createBrowserAuth(root);
  let disposed = false;
  return {
    application,
    session,
    providers: providerDiscovery.providers,
    loginUrl: providerDiscovery.loginUrl,
    connect: () => session.refresh(),
    logout: () => session.logout(),
    dispose() {
      if (disposed) return;
      disposed = true;
      session.dispose();
      application.disconnect();
      bootstrap.close();
    },
  };
}
