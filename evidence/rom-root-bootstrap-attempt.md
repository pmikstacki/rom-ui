# First root integration attempt

The source guard detected a concurrent change in crates/rom-redb/src/native_journal_tests.rs before copying migration files.
The shell then attempted an unpinned Corepack invocation.
Corepack selected pnpm 12.10.1 and failed with MODULE_NOT_FOUND for its missing bin/pnpm.cjs.
Its added packageManager field was removed after comparing the remaining manifest with the exact backup.
The next attempt used a stop-on-error shell and the verified pnpm 10.30.0 manifest.
The first install log was overwritten by the successful installation log.
This note preserves the captured failure facts; it is not the original raw log.
