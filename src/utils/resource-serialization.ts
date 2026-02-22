import type { CollectionEntry } from 'astro:content';

import { getNotionEntryTitle } from '~/utils/notion';
import { getResourceCanonicalSlug } from '~/utils/resource-slug';
import { toStringArray } from '~/utils/string-array';

export type ResourceEntry = CollectionEntry<'resources'>;

export { toStringArray } from '~/utils/string-array';

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
    const entryCategories = entry.data.Category;
    const entryTypes = entry.data.Type;

    const categoryMatch = Array.isArray(entryCategories) ? entryCategories.includes(category) : entryCategories === category;
    const typeMatch = Array.isArray(entryTypes) ? entryTypes.includes(type) : entryTypes === type;

    return categoryMatch && typeMatch;
  });
};
