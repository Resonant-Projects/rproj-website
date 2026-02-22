import { SEARCH_PARAM } from '~/utils/search-routing';

interface ResourceListingEntry {
  id: string;
  title: string;
  summary: string;
  categories: string[];
  types: string[];
  href: string;
  source?: string;
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const renderCard = (entry: ResourceListingEntry): string => {
  const category = entry.categories[0];
  const type = entry.types[0];
  const sourceMarkup = entry.source
    ? `<a href="${escapeHtml(entry.source)}" target="_blank" rel="noopener noreferrer" class="text-xs font-medium text-primary transition-colors hover:text-accent">View Source →</a>`
    : '';

  return `<article class="resource-card group rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg">
    <div class="mb-3">
      <h3 class="mb-2 text-lg font-semibold leading-tight">
        <a href="${escapeHtml(entry.href)}" class="text-card-foreground transition-colors hover:text-primary group-hover:underline">${escapeHtml(entry.title)}</a>
      </h3>
      ${
        entry.summary
          ? `<p class="line-clamp-3 text-sm leading-relaxed text-muted-foreground">${escapeHtml(entry.summary)}</p>`
          : ''
      }
    </div>
    <div class="mb-3 flex flex-wrap gap-2">
      ${category ? `<span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">${escapeHtml(category)}</span>` : ''}
      ${type ? `<span class="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">${escapeHtml(type)}</span>` : ''}
    </div>
    <div class="flex items-center justify-between">
      <div class="text-xs text-muted-foreground">
        ${
          type && category
            ? `<span>Type: ${escapeHtml(type)} · Category: ${escapeHtml(category)}</span>`
            : type
              ? `<span>Type: ${escapeHtml(type)}</span>`
              : category
                ? `<span>Category: ${escapeHtml(category)}</span>`
                : ''
        }
      </div>
      ${sourceMarkup}
    </div>
  </article>`;
};

const normalizeArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  return [];
};

const parseEntries = (raw: unknown): ResourceListingEntry[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map(item => {
      const record = item as Record<string, unknown>;

      return {
        id: String(record.id ?? ''),
        title: String(record.title ?? ''),
        summary: String(record.summary ?? ''),
        categories: normalizeArray(record.categories),
        types: normalizeArray(record.types),
        href: String(record.href ?? ''),
        source: typeof record.source === 'string' ? record.source : undefined,
      };
    })
    .filter(entry => entry.id && entry.title && entry.href);
};

const applySearch = (root: HTMLElement) => {
  const datasetScript = root.querySelector<HTMLScriptElement>('[data-resources-dataset]');
  const searchResults = root.querySelector<HTMLElement>('[data-resources-search-results]');
  const defaultContent = root.querySelector<HTMLElement>('[data-resources-default-content]');
  const queryDisplay = root.querySelector<HTMLElement>('[data-search-query-display]');
  const summary = root.querySelector<HTMLElement>('[data-search-summary]');

  if (!datasetScript || !searchResults || !defaultContent) {
    return;
  }

  const searchQuery = new URLSearchParams(window.location.search).get(SEARCH_PARAM)?.trim() ?? '';

  if (!searchQuery) {
    defaultContent.classList.remove('hidden');
    searchResults.classList.add('hidden');

    if (queryDisplay) {
      queryDisplay.textContent = '';
      queryDisplay.classList.add('hidden');
    }

    if (summary) {
      summary.classList.add('hidden');
    }

    return;
  }

  let entries: ResourceListingEntry[] = [];
  try {
    entries = parseEntries(JSON.parse(datasetScript.textContent || '[]'));
  } catch {
    entries = [];
  }

  const needle = searchQuery.toLowerCase();
  const filtered = entries.filter(entry => {
    return (
      entry.title.toLowerCase().includes(needle) ||
      entry.summary.toLowerCase().includes(needle) ||
      entry.categories.some(category => category.toLowerCase().includes(needle)) ||
      entry.types.some(type => type.toLowerCase().includes(needle))
    );
  });

  defaultContent.classList.add('hidden');
  searchResults.classList.remove('hidden');

  if (queryDisplay) {
    queryDisplay.textContent = `: "${searchQuery}"`;
    queryDisplay.classList.remove('hidden');
  }

  if (summary) {
    summary.textContent = `Showing ${filtered.length} result${filtered.length === 1 ? '' : 's'} for "${searchQuery}"`;
    summary.classList.remove('hidden');
  }

  if (!filtered.length) {
    searchResults.innerHTML = `<div class="py-12 text-center"><h2 class="mb-2 text-xl font-semibold text-muted-foreground">No search results found</h2><p class="text-muted-foreground">Try a different search term.</p></div>`;
    return;
  }

  searchResults.innerHTML = `<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">${filtered.map(renderCard).join('')}</div>`;
};

export const initializeResourcesListing = () => {
  document.querySelectorAll<HTMLElement>('[data-resources-page]').forEach(applySearch);
};
