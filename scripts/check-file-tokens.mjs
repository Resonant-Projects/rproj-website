#!/usr/bin/env node
/**
 * Pre-commit guard: block committing files over MAX_TOKENS estimated tokens.
 *
 * Tokens are estimated as bytes / BYTES_PER_TOKEN (5,000 tokens ≈ 20,000 bytes).
 * Only STAGED files are checked, and the staged blob is measured (not the
 * working tree), so partial stages (`git add -p`) are measured accurately.
 *
 * Usage:
 *   node scripts/check-file-tokens.mjs          # check staged files (pre-commit)
 *   node scripts/check-file-tokens.mjs --all    # report every tracked file over the limit
 *
 * Emergency bypass: git commit --no-verify
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

export const MAX_TOKENS = 5000;
export const BYTES_PER_TOKEN = 4;
const MAX_BYTES = MAX_TOKENS * BYTES_PER_TOKEN;

// ---------------------------------------------------------------------------
// IGNORE LIST — files not authored by humans or agents are exempt.
// Edit freely. Patterns are matched against the repo-relative POSIX path.
//   - BASENAMES: exact file names, matched anywhere in the tree
//   - EXTENSIONS: lower-cased suffixes (include the leading dot)
//   - GLOBS: minimatch-style, `**` = any depth, `*` = within one segment
// Anything git itself treats as binary is also skipped automatically.
// ---------------------------------------------------------------------------
export const IGNORE_BASENAMES = [
  // Lockfiles
  'bun.lock',
  'bun.lockb',
  'package-lock.json',
  'npm-shrinkwrap.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'Cargo.lock',
  'poetry.lock',
  'uv.lock',
  'Gemfile.lock',
  'go.sum',
  'composer.lock',
  'flake.lock',
  // Generated type declarations
  'routeTree.gen.ts',
  'worker-configuration.d.ts',
];

export const IGNORE_EXTENSIONS = [
  // Images
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.svg',
  '.ico',
  '.bmp',
  '.tiff',
  '.heic',
  // Fonts
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.eot',
  // Archives / binaries / documents
  '.zip',
  '.gz',
  '.tgz',
  '.tar',
  '.bz2',
  '.xz',
  '.7z',
  '.rar',
  '.pdf',
  '.db',
  '.sqlite',
  '.sqlite3',
  '.wasm',
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  // Audio / video
  '.mp3',
  '.wav',
  '.flac',
  '.aac',
  '.ogg',
  '.m4a',
  '.mp4',
  '.mov',
  '.webm',
  '.mkv',
  '.avi',
  // Source maps
  '.map',
];

export const IGNORE_GLOBS = [
  // Generated / codegen output
  'convex/_generated/**',
  '**/generated/**',
  '**/*.gen.*',
  '**/__snapshots__/**',
  // Minified bundles
  '**/*.min.*',
  // Build output (normally gitignored, listed defensively)
  'dist/**',
  'build/**',
  '.astro/**',
  // --- Repo-specific additions (rproj-website) ---
  // Vendored third-party packages kept in sync with upstream, not authored here
  'vendor/**',
  // Pagefind search index copied into public/ for the dev server
  'public/pagefind/**',
  // Cached Notion resources snapshot
  'src/content/resources-cache.json',
  // Editor rule files installed by tooling (e.g. Task Master)
  '.cursor/**',
];

// ---------------------------------------------------------------------------

function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        // `**/` matches zero or more directories; bare `**` matches anything
        if (glob[i + 2] === '/') {
          re += '(?:.*/)?';
          i += 2;
        } else {
          re += '.*';
          i += 1;
        }
      } else {
        re += '[^/]*';
      }
    } else if (c === '?') {
      re += '[^/]';
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${re}$`);
}

const GLOB_RES = IGNORE_GLOBS.map(globToRegExp);
const EXT_SET = new Set(IGNORE_EXTENSIONS.map(e => e.toLowerCase()));
const BASENAME_SET = new Set(IGNORE_BASENAMES);

export function isIgnored(file) {
  const base = path.posix.basename(file);
  if (BASENAME_SET.has(base)) return true;
  if (EXT_SET.has(path.posix.extname(base).toLowerCase())) return true;
  return GLOB_RES.some(re => re.test(file));
}

function git(args, input) {
  const res = spawnSync('git', args, { encoding: 'utf8', input, maxBuffer: 64 * 1024 * 1024 });
  if (res.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed:\n${res.stderr}`);
  }
  return res.stdout;
}

/** Returns { files: string[], prefix: string } where prefix resolves blobs (":" = index, "HEAD:" = commit). */
function collectCandidates(all) {
  if (all) {
    const files = git(['ls-files', '-z']).split('\0').filter(Boolean);
    // Diff HEAD against the empty tree so git tells us which blobs it treats as binary.
    const emptyTree = git(['hash-object', '-t', 'tree', '/dev/null']).trim();
    const numstat = git(['diff', '--numstat', '--no-renames', '-z', emptyTree, 'HEAD']);
    return { files, binary: parseBinary(numstat), prefix: 'HEAD:' };
  }
  const files = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']).split('\0').filter(Boolean);
  const numstat = git(['diff', '--cached', '--numstat', '--no-renames', '-z']);
  return { files, binary: parseBinary(numstat), prefix: ':' };
}

/** git reports `-\t-\tpath` for files it considers binary. */
function parseBinary(numstat) {
  const binary = new Set();
  for (const line of numstat.split('\0')) {
    const [added, deleted, file] = line.split('\t');
    if (file && added === '-' && deleted === '-') binary.add(file);
  }
  return binary;
}

function blobSizes(files, prefix) {
  if (files.length === 0) return new Map();
  const out = git(['cat-file', '--batch-check=%(objectsize)'], files.map(f => `${prefix}${f}\n`).join(''));
  const lines = out.trimEnd().split('\n');
  const sizes = new Map();
  files.forEach((file, i) => {
    const n = Number(lines[i]);
    if (Number.isFinite(n)) sizes.set(file, n);
  });
  return sizes;
}

export function findOversized({ all = false } = {}) {
  const { files, binary, prefix } = collectCandidates(all);
  const candidates = files.filter(f => !binary.has(f) && !isIgnored(f));
  const sizes = blobSizes(candidates, prefix);
  return candidates
    .map(file => ({ file, bytes: sizes.get(file) ?? 0, tokens: Math.ceil((sizes.get(file) ?? 0) / BYTES_PER_TOKEN) }))
    .filter(e => e.bytes > MAX_BYTES)
    .sort((a, b) => b.bytes - a.bytes);
}

function report(offenders, all) {
  const fmt = n => n.toLocaleString('en-US');
  const scope = all ? 'tracked' : 'staged';
  console.error(
    `\n✖ ${offenders.length} ${scope} file(s) exceed the ${fmt(MAX_TOKENS)}-token limit (≈${fmt(MAX_BYTES)} bytes):\n`
  );
  for (const { file, bytes, tokens } of offenders) {
    console.error(`  ${file}  —  ~${fmt(tokens)} tokens (${fmt(bytes)} bytes)`);
  }
  if (all) return;
  console.error(`
Large files are hard for people and AI agents to read, review, and edit safely.
Split each file above before committing:

  1. Split by responsibility: one module per concern (data loading, rendering,
     validation, …) instead of one file that does everything.
  2. Move types, interfaces, constants, and small helpers into their own files
     (e.g. foo.types.ts, foo.constants.ts, foo.helpers.ts).
  3. Extract components and sub-functions into sibling files and import them.
  4. If callers depend on a single import path, re-export from an index file
     (index.ts) so the public API does not change.
  5. Keep every new file under ${fmt(MAX_TOKENS)} tokens (≈${fmt(MAX_BYTES)} bytes).

Emergency bypass (use sparingly, and say why in the commit message):

  git commit --no-verify

If a file is genuinely generated, vendored, or binary, add its path to the
ignore list at the top of scripts/check-file-tokens.mjs (IGNORE_BASENAMES,
IGNORE_EXTENSIONS, or IGNORE_GLOBS) instead of bypassing the hook.
`);
}

function main() {
  const all = process.argv.includes('--all');
  const offenders = findOversized({ all });
  if (offenders.length === 0) {
    if (all) console.log(`✓ No tracked files exceed ${MAX_TOKENS.toLocaleString('en-US')} tokens.`);
    return;
  }
  report(offenders, all);
  process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  main();
}
