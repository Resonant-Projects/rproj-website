import { defineCollection, z } from 'astro:content';
import { file, glob, type Loader } from 'astro/loaders';
import { existsSync } from 'node:fs';
import type { NotionLoaderOptions } from '../vendor/notion-astro-loader/src/loader.js';
import { githubEditorialLoader } from './loaders/githubEditorialLoader';

const parseResourcesCache = (source: string): Array<Record<string, unknown>> => {
  let payload: unknown;
  try {
    payload = JSON.parse(source) as unknown;
  } catch {
    // parseResourcesCache should tolerate malformed JSON.parse input and fail closed.
    return [];
  }
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item, index) => {
    const value = item as Record<string, unknown>;
    const id = typeof value.id === 'string' && value.id ? value.id : `cache-${index}`;
    const sourceData = (value.data as Record<string, unknown> | undefined) ?? value;
    return {
      ...sourceData,
      id,
    };
  });
};

const resourcesCachePath = 'src/content/resources-cache.json';
const resourcesCacheFileLoader = file(resourcesCachePath, {
  parser: parseResourcesCache,
});
const fallbackResourcesLoader: Loader = {
  name: 'resources-fallback-loader',
  load: async context => {
    const resourcesCacheUrl = new URL(resourcesCachePath, context.config.root);
    if (!existsSync(resourcesCacheUrl)) {
      context.store.clear();
      return;
    }

    await resourcesCacheFileLoader.load(context);
  },
};
const isDevServer = import.meta.env.DEV;

let notionLoaderFactory: ((options: NotionLoaderOptions) => Loader) | null = null;
if (!isDevServer) {
  try {
    const module = await import('../vendor/notion-astro-loader/src/loader.js');
    notionLoaderFactory = module.notionLoader;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[resources-notion-loader] Falling back to cache loader: ${message}`);
  }
}

const createNotionResourcesLoader = (auth: string, databaseId: string): Loader => {
  if (!notionLoaderFactory) {
    return fallbackResourcesLoader;
  }

  return notionLoaderFactory({
    auth,
    database_id: databaseId,
    imageSavePath: 'content/notion/images',
    filter: {
      property: 'Status',
      status: { equals: 'Up-to-Date' },
    },
  });
};

// Shared metadataDefinition for collections
const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ['**/*.md', '**/*.mdx'], base: 'src/content/post' }),
  schema: ({ image }) =>
    z.object({
      publishDate: z.date().optional(),
      updateDate: z.date().optional(),
      draft: z.boolean().optional(),

      title: z.string(),
      excerpt: z.string().optional(),
      image: image().optional(),

      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      author: z.string().optional(),

      metadata: metadataDefinition(),
    }),
});

const tilCollection = defineCollection({
  loader: glob({ pattern: ['**/*.md', '**/*.mdx'], base: 'src/content/til' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      tags: z.array(z.string()),
      description: z.string(),
      draft: z.boolean().optional(),
      image: image().optional(),
      metadata: metadataDefinition(),
    }),
});

const editorialCollection = defineCollection({
  loader: githubEditorialLoader(),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    kind: z.enum(['experiment_recap', 'what_changed_my_mind', 'campaign_summary', 'thesis_summary']),
    publishedAt: z.coerce.date(),
    dek: z.string(),
    evidenceStatus: z.enum(['supported', 'mixed', 'speculative']),
    uncertaintySummary: z.string(),
    whyItMatters: z.string(),
    campaignSlug: z.string().optional(),
    thesisSlugs: z.array(z.string()).optional(),
    canonicalAppUrl: z.string().url(),
  }),
});

const notionToken = import.meta.env.NOTION_TOKEN;
const notionResourcesDatabaseId = import.meta.env.NOTION_RR_RESOURCES_ID;

const resourcesLoader =
  notionToken && notionResourcesDatabaseId
    ? createNotionResourcesLoader(notionToken, notionResourcesDatabaseId)
    : fallbackResourcesLoader;

export const collections = {
  post: postCollection,
  til: tilCollection,
  editorial: editorialCollection,
  resources: defineCollection({
    loader: resourcesLoader,
    // Schema: start from Notion property types; refine as needed
    schema: z.object({
        // Include raw Notion properties so we can derive titles when needed
        properties: z.any().optional(),
        // Flattened map of all property values for convenient access
        flat: z.record(z.string(), z.unknown()).optional(),
        rawTransformedProperties: z.record(z.string(), z.unknown()).optional(),
        Name: z.string().optional(),
        Source: z.string().url().optional(),
        'User Defined URL': z.string().url().optional(),
        Category: z.array(z.string()).optional(),
        Type: z.array(z.string()).optional(),
        Tags: z.array(z.string()).optional(),
        Keywords: z.array(z.string()).optional(),
        Status: z.enum(['Needs Review', 'Writing', 'Needs Update', 'Up-to-Date']).optional(),
        Length: z.enum(['Short', 'Medium', 'Long']).optional(),
        'AI summary': z.string().optional(),
        'Last Updated': z
          .union([
            z.date(),
            z.string(),
            z
              .object({
                start: z.date().optional(),
                end: z.date().nullable(),
                time_zone: z.string().nullable(),
              })
              .nullable(),
          ])
          .optional(),
        'Skill Level': z.enum(['Beginner', 'Intermediate', 'Advanced', 'Any']).optional(),
        Favorite: z.boolean().optional(),
      }),
  }),
};
