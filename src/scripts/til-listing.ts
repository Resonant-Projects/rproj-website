import { SEARCH_PARAM } from '~/utils/search-routing';

interface TilListingEntry {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const slugifyTag = (tag: string): string => tag.toLowerCase().replace(/\s+/g, '-');

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const renderTilCard = (entry: TilListingEntry): string => {
  const maxLength = 150;
  const description = entry.description.length > maxLength ? `${entry.description.slice(0, maxLength)}...` : entry.description;

  return `<article class="til-card" data-til-entry-id="${escapeHtml(entry.id)}">
    <div class="flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:shadow-md">
      <div class="mb-2 flex items-start justify-between">
        <span class="text-sm text-muted-foreground">${escapeHtml(formatDate(entry.date))}</span>
      </div>
      <h3 class="mb-2 text-xl font-bold text-foreground transition-colors hover:text-primary">
        <a href="/til/${escapeHtml(entry.slug)}">${escapeHtml(entry.title)}</a>
      </h3>
      <p class="mb-4 grow text-muted-foreground">${escapeHtml(description)}</p>
      <div class="mt-auto flex flex-wrap gap-2">
        ${entry.tags
          .map(tag => `<a href="/til/${escapeHtml(slugifyTag(tag))}/1" class="relative z-10 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20">#${escapeHtml(tag)}</a>`)
          .join('')}
      </div>
    </div>
  </article>`;
};

const parseEntries = (raw: unknown): TilListingEntry[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map(item => {
      const record = item as Record<string, unknown>;
      const tags = Array.isArray(record.tags) ? record.tags.map(String).filter(Boolean) : [];

      return {
        id: String(record.id ?? ''),
        slug: String(record.slug ?? ''),
        title: String(record.title ?? ''),
        description: String(record.description ?? ''),
        tags,
        date: String(record.date ?? ''),
      };
    })
    .filter(entry => entry.id && entry.slug && entry.title);
};

const applySearch = (root: HTMLElement) => {
  const datasetScript = root.querySelector<HTMLScriptElement>('[data-til-dataset]');
  const searchResults = root.querySelector<HTMLElement>('[data-til-search-results]');
  const defaultContent = root.querySelector<HTMLElement>('[data-til-default-content]');
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

  let entries: TilListingEntry[] = [];
  try {
    entries = parseEntries(JSON.parse(datasetScript.textContent || '[]'));
  } catch {
    entries = [];
  }

  const needle = searchQuery.toLowerCase();
  const filtered = entries.filter(entry => {
    return (
      entry.title.toLowerCase().includes(needle) ||
      entry.description.toLowerCase().includes(needle) ||
      entry.tags.some(tag => tag.toLowerCase().includes(needle))
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

  searchResults.innerHTML = `<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">${filtered.map(renderTilCard).join('')}</div>`;
};

export const initializeTilListing = () => {
  document.querySelectorAll<HTMLElement>('[data-til-page]').forEach(applySearch);
};
