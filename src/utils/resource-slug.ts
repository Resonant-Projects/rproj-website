import type { CollectionEntry } from 'astro:content';

import { getNotionEntryTitle } from '~/utils/notion';
import { cleanSlug } from '~/utils/permalinks';

export type ResourceEntry = CollectionEntry<'resources'>;

export const getResourceLegacySlug = (entry: ResourceEntry): string => {
  return cleanSlug(getNotionEntryTitle(entry));
};

export const getResourceCanonicalSlug = (entry: ResourceEntry): string => {
  const legacySlug = getResourceLegacySlug(entry) || 'resource';
  const shortId = entry.id.replace(/-/g, '').slice(0, 8).toLowerCase();
  return `${legacySlug}-${shortId}`;
};
