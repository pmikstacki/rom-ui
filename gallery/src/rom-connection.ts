import { createAppSession, type StudioAuthProfile } from "rom-studio/application";

/** Use ROM's shared session composition; the host retains policy and storage. */
export function createRomConnection(base: string, bootstrap: { profile: StudioAuthProfile; close(): void }) {
  const store = bootstrap.profile.recovery.intentStore;
  const localVersions = new Map<string, string>();
  const profile: StudioAuthProfile = {
    ...bootstrap.profile,
    recovery: {
      ...bootstrap.profile.recovery,
      intentStore: {
        read: slot => store.read(slot),
        async compareExchange(slot, expected, next) {
          const accepted = await store.compareExchange(slot, expected, next);
          if (accepted) {
            if (next) localVersions.set(slot, next.version);
            else localVersions.delete(slot);
          }
          return accepted;
        },
      },
    },
  };
  const session = createAppSession({ base, profile });
  let disposed = false;
  return {
    application: session.controller,
    session: session.lifecycle,
    providers: session.providers,
    loginUrl: session.loginUrl,
    connect: session.refresh,
    logout: session.logout,
    intentIdentity(target: { kind: string; id: string }) {
      const identity = session.lifecycle.state.identity;
      if (disposed || session.lifecycle.state.status !== "authenticated" || !identity) return null;
      const slot = bootstrap.profile.recovery.slot(identity.principal, target, "intent");
      const version = localVersions.get(slot);
      return version ? { slot, version, generation: identity.generation } : null;
    },
    async ownsIntent(identity: { slot: string; version: string; generation: string }) {
      if (disposed || session.lifecycle.state.identity?.generation !== identity.generation) return false;
      const stored = await store.read(identity.slot);
      return !disposed && session.lifecycle.state.identity?.generation === identity.generation
        && localVersions.get(identity.slot) === identity.version && stored?.version === identity.version;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      localVersions.clear();
      session.destroy();
      bootstrap.close();
    },
  };
}
