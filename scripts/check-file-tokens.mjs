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
import { fileURLToPath } from 'node:url';

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
  // `s` flag: `.*` from `**` must also span newlines embedded in a path.
  return new RegExp(`^${re}$`, 's');
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

/**
 * Git output is read as latin1, which maps every byte to one character, so file names that are
 * not valid UTF-8 survive unchanged. Use toDisplay() to turn such a name into readable text.
 */
function git(args, input) {
  const res = spawnSync('git', args, { encoding: 'latin1', input, maxBuffer: 64 * 1024 * 1024 });
  if (res.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed:\n${res.stderr}`);
  }
  return res.stdout;
}

/** Decode a latin1-read git path as UTF-8 for matching and messages. */
const toDisplay = rawPath => Buffer.from(rawPath, 'latin1').toString('utf8');

/**
 * Returns the candidate entries ({ file, blob }) plus the set git considers binary.
 * Both modes read the index: the pre-commit mode looks only at staged changes,
 * `--all` at every tracked file. Sizes are looked up by the staged blob's object
 * id, so file names never have to be passed back to git.
 */
function collectCandidates(all) {
  // Diffing against the empty tree makes git report every indexed file, so it
  // tells us which ones it treats as binary — and works in a repo without HEAD.
  const emptyTree = git(['hash-object', '-t', 'tree', '/dev/null']).trim();
  // T (type change) catches a tracked symlink replaced by a regular file, which ACMR would skip.
  const common = ['diff', '--cached', '--no-renames', '-z', '--diff-filter=ACMRT'];
  const range = all ? [emptyTree] : [];
  const files = parseRaw(git([...common, '--raw', '--no-abbrev', ...range]));
  const binary = parseBinary(git([...common, '--numstat', ...range]));
  return { files, binary };
}

const GITLINK_MODE = '160000';

/**
 * `--raw -z` emits `:oldmode newmode oldsha newsha status\0path\0` per entry.
 * `newsha` is the blob in the index. Submodule entries (gitlinks) point at commits
 * in another object database and have no blob size, so they are dropped here.
 */
function parseRaw(raw) {
  const parts = raw.split('\0');
  const files = [];
  for (let i = 0; i + 1 < parts.length; i += 2) {
    const [, newMode, , blob] = parts[i].split(' ');
    const file = parts[i + 1];
    if (file && newMode !== GITLINK_MODE) files.push({ file, blob });
  }
  return files;
}

/** git reports `-\t-\tpath` for files it considers binary. Paths may contain tabs. */
function parseBinary(numstat) {
  const binary = new Set();
  for (const line of numstat.split('\0')) {
    const first = line.indexOf('\t');
    const second = line.indexOf('\t', first + 1);
    if (first < 0 || second < 0) continue;
    const added = line.slice(0, first);
    const deleted = line.slice(first + 1, second);
    const file = line.slice(second + 1);
    if (file && added === '-' && deleted === '-') binary.add(file);
  }
  return binary;
}

/** Size of each staged blob, by object id, in one `git cat-file --batch-check` call. */
function blobSizes(blobs) {
  const sizes = new Map();
  if (blobs.length === 0) return sizes;
  const out = git(['cat-file', '--batch-check=%(objectname) %(objectsize)'], blobs.map(b => `${b}\n`).join(''));
  for (const line of out.trimEnd().split('\n')) {
    const [blob, size] = line.split(' ');
    sizes.set(blob, Number(size));
  }
  for (const blob of blobs) {
    if (!Number.isFinite(sizes.get(blob))) throw new Error(`Could not read staged blob size for ${blob}`);
  }
  return sizes;
}

export function findOversized({ all = false } = {}) {
  const { files, binary } = collectCandidates(all);
  const candidates = files.filter(({ file }) => !binary.has(file) && !isIgnored(toDisplay(file)));
  const sizes = blobSizes(candidates.map(({ blob }) => blob));
  return candidates
    .map(({ file, blob }) => {
      const bytes = sizes.get(blob);
      return { file: toDisplay(file), bytes, tokens: Math.ceil(bytes / BYTES_PER_TOKEN) };
    })
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
