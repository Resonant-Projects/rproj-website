#!/usr/bin/env node
/**
 * Syncs pagefind index from build output to public/ for dev server.
 * Run before `astro dev` to enable search in development.
 */
import fs from 'fs';

const BUILD_INDEX = 'dist/client/pagefind';
const DEV_INDEX = 'public/pagefind';

if (fs.existsSync(BUILD_INDEX)) {
  // Remove stale dev index
  if (fs.existsSync(DEV_INDEX)) {
    fs.rmSync(DEV_INDEX, { recursive: true });
  }
  // Copy fresh index
  fs.cpSync(BUILD_INDEX, DEV_INDEX, { recursive: true });
  console.log(`✓ Pagefind index synced from ${BUILD_INDEX}`);
} else {
  console.log(`⚠ No pagefind index found. Run 'bun run build' first for search to work.`);
}
