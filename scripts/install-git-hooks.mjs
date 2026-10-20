#!/usr/bin/env node
/**
 * `prepare` script: installs the git hooks from package.json via simple-git-hooks.
 * - simple-git-hooks is a devDependency, so a production install (`bun install --production`)
 *   does not have it; skip quietly there.
 * - The stock `simple-git-hooks` CLI logs an error but exits 0 when it cannot write the hook
 *   (for example an unwritable .git/hooks). Call its API instead and exit non-zero, so a
 *   missing pre-commit guard is visible.
 * - SKIP_INSTALL_SIMPLE_GIT_HOOKS=1 still skips installation, as with the CLI.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let hooks;
try {
  hooks = require('simple-git-hooks');
} catch {
  console.log('simple-git-hooks is not installed (production install?); git hooks not set up.');
  process.exit(0);
}

if (hooks.skipInstall?.()) process.exit(0);

try {
  const { isHookChanged } = await hooks.setHooksFromConfig(process.cwd(), process.argv);
  if (isHookChanged) console.log('[INFO] Successfully set all git hooks');
} catch (error) {
  console.error(`[ERROR] Could not set git hooks: ${error?.message ?? error}`);
  process.exit(1);
}
