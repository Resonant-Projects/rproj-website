import type { Loader } from 'astro/loaders';
import { readFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { load as loadYaml } from 'js-yaml';
import { FREQUENCY_EXPORTS_DIR, getEssayContentBaseUrl, getEssayManifestUrl } from '~/utils/frequency';

type EssayManifestItem = {
  slug: string;
  path: string;
  title: string;
  publishDate: string | null;
  category: string;
};

type EssayManifest = {
  version: 'frequency_essays_v1';
  generatedAt: string;
  items: EssayManifestItem[];
};

type ManifestSource =
  | {
      mode: 'remote';
      manifestUrl: URL;
      contentBaseUrl: URL;
      manifest: EssayManifest;
    }
  | {
      mode: 'local';
      baseDir: string;
      manifest: EssayManifest;
    };

function parseManifest(raw: string): EssayManifest {
  const parsed = JSON.parse(raw) as Partial<EssayManifest>;
  if (parsed.version !== 'frequency_essays_v1' || !Array.isArray(parsed.items)) {
    throw new Error('Essay manifest is missing the frequency_essays_v1 contract.');
  }
  return parsed as EssayManifest;
}

function parseMarkdownDocument(source: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('Essay markdown file is missing frontmatter.');
  }

  return {
    frontmatter: loadYaml(match[1] ?? '') as Record<string, unknown>,
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
  const manifestLocation = getEssayManifestUrl();
  const contentBaseUrl = getEssayContentBaseUrl();
  try {
    const manifest = parseManifest(await fetchText(manifestLocation));
    return {
      mode: 'remote',
      manifestUrl: manifestLocation,
      contentBaseUrl,
      manifest,
    };
  } catch {
    // Remote fetch failed
  }

  if (FREQUENCY_EXPORTS_DIR !== null) {
    const manifestPath = join(FREQUENCY_EXPORTS_DIR, 'blog', 'manifest.json');

    let manifestRaw: string;
    try {
      manifestRaw = await readFile(manifestPath, 'utf8');
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw err;
    }

    return {
      mode: 'local',
      baseDir: join(FREQUENCY_EXPORTS_DIR, 'blog'),
      manifest: parseManifest(manifestRaw),
    };
  }

  return null;
}

async function loadMarkdownEntry(
  source: ManifestSource,
  relativePath: string
): Promise<{ raw: string; fileUrl?: URL }> {
  if (source.mode === 'remote') {
    const url = new URL(relativePath, source.contentBaseUrl);
    const basePath = source.contentBaseUrl.pathname.endsWith('/')
      ? source.contentBaseUrl.pathname
      : `${source.contentBaseUrl.pathname}/`;
    if (url.origin !== source.contentBaseUrl.origin || !url.pathname.startsWith(basePath)) {
      throw new Error(`Essay path escapes content base: ${relativePath}`);
    }
    return { raw: await fetchText(url), fileUrl: url };
  }

  const baseDir = resolve(source.baseDir);
  const filePath = resolve(baseDir, relativePath);
  if (filePath !== baseDir && !filePath.startsWith(`${baseDir}${sep}`)) {
    throw new Error(`Essay path escapes export directory: ${relativePath}`);
  }
  return {
    raw: await readFile(filePath, 'utf8'),
    fileUrl: pathToFileURL(filePath),
  };
}

export function frequencyEssayLoader(): Loader {
  return {
    name: 'frequency-essay-loader',
    load: async context => {
      const source = await loadManifestSource();

      if (!source) {
        context.logger.warn(
          'No essay manifest found. Check network access or set FREQUENCY_LOCAL_EXPORT_DIR for local development.'
        );
        return;
      }

      for (const item of source.manifest.items) {
        try {
          const { raw, fileUrl } = await loadMarkdownEntry(source, item.path);
          const { frontmatter, body } = parseMarkdownDocument(raw);
          const parsedData = await context.parseData({
            id: `essay/${item.slug}`,
            data: frontmatter,
          });
          const rendered = await context.renderMarkdown(body, {
            fileURL: source.mode === 'local' ? fileUrl : undefined,
          });
          context.store.set({
            id: `essay/${item.slug}`,
            data: parsedData,
            body,
            digest: context.generateDigest(raw),
            rendered,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          context.logger.error(`Failed to load essay ${item.slug}: ${message}`);
        }
      }
    },
  };
}
