import type { CollectionEntry } from 'astro:content';

import { getNotionEntryTitle } from '~/utils/notion';
import { getResourceCanonicalSlug } from '~/utils/resource-slug';
import { toStringArray } from '~/utils/string-array';

export type ResourceEntry = CollectionEntry<'resources'>;

export const serializeResourceEntry = (entry: ResourceEntry) => {
  const data = entry.data;
  return {
    id: entry.id,
    title: data.Name || getNotionEntryTitle(entry),
    summary: data['AI summary'] || '',
    categories: toStringArray(data.Category),
    types: toStringArray(data.Type),
    href: `/resources/${getResourceCanonicalSlug(entry)}`,
    source: data.Source || data['User Defined URL'] || '',
  };
};

export const filterByCategoryAndType = (
  entries: ResourceEntry[],
  category: string,
  type: string
): ResourceEntry[] => {
  return entries.filter(entry => {
    const entryCategories = toStringArray(entry.data.Category);
    const entryTypes = toStringArray(entry.data.Type);

    const categoryMatch = entryCategories.includes(category);
    const typeMatch = entryTypes.includes(type);

    return categoryMatch && typeMatch;
  });
};
