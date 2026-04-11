import type { Loader } from 'astro/loaders';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { load as loadYaml } from 'js-yaml';

type EditorialManifestEntry = {
  slug: string;
  path: string;
  title: string;
  kind: 'experiment_recap' | 'what_changed_my_mind' | 'campaign_summary' | 'thesis_summary';
  publishedAt: number;
  evidenceStatus: 'supported' | 'mixed' | 'speculative';
};

type EditorialManifest = {
  version: 'public_editorial_v1';
  generatedAt?: string;
  items: EditorialManifestEntry[];
};

type ManifestSource =
  | {
      mode: 'remote';
      manifestUrl: URL;
      contentBaseUrl: URL;
      manifest: EditorialManifest;
    }
  | {
      mode: 'local';
      baseDir: string;
      manifest: EditorialManifest;
    };

const DEFAULT_LOCAL_EXPORT_DIR = resolve(process.cwd(), '../frequency-music/exports/public-editorial/v1');

function parseManifest(raw: string): EditorialManifest {
  const parsed = JSON.parse(raw) as Partial<EditorialManifest>;
  if (parsed.version !== 'public_editorial_v1' || !Array.isArray(parsed.items)) {
    throw new Error('Editorial manifest is missing the public_editorial_v1 contract.');
  }
  return parsed as EditorialManifest;
}

function parseMarkdownDocument(source: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('Editorial markdown file is missing frontmatter.');
  }

  const frontmatter = loadYaml(match[1] ?? '') as Record<string, unknown>;
  return {
    frontmatter,
    body: match[2] ?? '',
  };
}

async function fetchText(url: URL): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url.toString()}: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

async function loadManifestSource(): Promise<ManifestSource | null> {
  const manifestUrl = process.env.EDITORIAL_MANIFEST_URL;
  if (manifestUrl) {
    const manifestLocation = new URL(manifestUrl);
    const rawContentBaseUrl = process.env.EDITORIAL_CONTENT_BASE_URL;
    const contentBaseUrl = rawContentBaseUrl
      ? new URL(rawContentBaseUrl.endsWith('/') ? rawContentBaseUrl : `${rawContentBaseUrl}/`)
      : new URL('./', manifestLocation);
    const manifest = parseManifest(await fetchText(manifestLocation));
    return {
      mode: 'remote',
      manifestUrl: manifestLocation,
      contentBaseUrl,
      manifest,
    };
  }

  const localBaseDir = process.env.EDITORIAL_LOCAL_EXPORT_DIR ?? DEFAULT_LOCAL_EXPORT_DIR;
  const manifestPath = join(localBaseDir, 'manifest.json');

  let manifestRaw: string;
  try {
    manifestRaw = await readFile(manifestPath, 'utf8');
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }

  const manifest = parseManifest(manifestRaw);
  return {
    mode: 'local',
    baseDir: localBaseDir,
    manifest,
  };
}

async function loadMarkdownEntry(
  source: ManifestSource,
  relativePath: string
): Promise<{ raw: string; fileUrl?: URL }> {
  if (source.mode === 'remote') {
    const url = new URL(relativePath, source.contentBaseUrl);
    return { raw: await fetchText(url), fileUrl: url };
  }

  const filePath = join(source.baseDir, relativePath);
  return {
    raw: await readFile(filePath, 'utf8'),
    fileUrl: pathToFileURL(filePath),
  };
}

export function githubEditorialLoader(): Loader {
  return {
    name: 'github-editorial-loader',
    load: async context => {
      const source = await loadManifestSource();

      if (!source) {
        context.store.clear();
        context.logger.warn(
          'No editorial manifest configured. Set EDITORIAL_MANIFEST_URL or provide a local export snapshot.'
        );
        return;
      }

      context.store.clear();

      for (const item of source.manifest.items) {
        try {
          const { raw, fileUrl } = await loadMarkdownEntry(source, item.path);
          const { frontmatter, body } = parseMarkdownDocument(raw);
          const parsedData = await context.parseData({
            id: item.slug,
            data: frontmatter,
          });
          const rendered = await context.renderMarkdown(body, { fileURL: fileUrl });
          context.store.set({
            id: item.slug,
            data: parsedData,
            body,
            digest: context.generateDigest(raw),
            rendered,
          });
        } catch (err) {
          context.logger.error(
            `Failed to load editorial entry "${item.slug}": ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    },
  };
}
