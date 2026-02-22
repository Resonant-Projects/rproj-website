import { expect, test, type Page } from '@playwright/test';

interface ResourceDatasetEntry {
  id: string;
  title: string;
  summary: string;
  categories: string[];
  types: string[];
  href: string;
  source?: string;
}

interface TilDatasetEntry {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
}

const IMPOSSIBLE_QUERY_PREFIX = '__no_match_query__';

const ensureArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => String(item).trim())
    .filter(Boolean);
};

const parseDataset = async <T>(page: Page, selector: string): Promise<T[]> => {
  const raw = await page.locator(selector).textContent();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const toResourceDataset = (raw: unknown[]): ResourceDatasetEntry[] => {
  return raw
    .map(item => {
      const entry = item as Record<string, unknown>;
      return {
        id: String(entry.id ?? ''),
        title: String(entry.title ?? ''),
        summary: String(entry.summary ?? ''),
        categories: ensureArray(entry.categories),
        types: ensureArray(entry.types),
        href: String(entry.href ?? ''),
        source: typeof entry.source === 'string' ? entry.source : undefined,
      };
    })
    .filter(entry => entry.id && entry.title && entry.href);
};

const toTilDataset = (raw: unknown[]): TilDatasetEntry[] => {
  return raw
    .map(item => {
      const entry = item as Record<string, unknown>;
      return {
        id: String(entry.id ?? ''),
        slug: String(entry.slug ?? ''),
        title: String(entry.title ?? ''),
        description: String(entry.description ?? ''),
        tags: ensureArray(entry.tags),
        date: String(entry.date ?? ''),
      };
    })
    .filter(entry => entry.id && entry.slug && entry.title);
};

const buildGuaranteedHitQuery = (value: string): string => {
  const normalized = value.trim();
  if (!normalized) {
    return 'default';
  }

  return normalized;
};

const buildImpossibleQuery = (): string => `${IMPOSSIBLE_QUERY_PREFIX}${Date.now()}`;

const expectUrl = async (
  page: Page,
  pathname: string,
  expectedSearch: Record<string, string | null | undefined>
): Promise<void> => {
  await expect
    .poll(() => {
      const url = new URL(page.url());
      if (url.pathname !== pathname) {
        return false;
      }

      return Object.entries(expectedSearch).every(([key, value]) => {
        const current = url.searchParams.get(key);
        if (value === undefined || value === null) {
          return current === null;
        }
        return current === value;
      });
    })
    .toBe(true);
};

test.describe('Resources static search journey', () => {
  test('redirect preserves search query', async ({ page }) => {
    await page.goto('/resources?search=foo');
    await expectUrl(page, '/resources/all/1', { search: 'foo' });
  });

  test('search submit shows filtered results and empty query restores default content', async ({ page }) => {
    await page.goto('/resources/all/1');

    const dataset = toResourceDataset(await parseDataset<unknown>(page, 'script[data-resources-dataset]'));
    expect(
      dataset.length,
      'Resources dataset is empty. Run `bun run resources:cache:refresh` before running e2e tests.'
    ).toBeGreaterThan(0);

    const query = buildGuaranteedHitQuery(dataset[0].title);

    const searchInput = page.locator('[data-resource-search-input]');
    const defaultContent = page.locator('[data-resources-default-content]');
    const searchResults = page.locator('[data-resources-search-results]');
    const summary = page.locator('[data-search-summary]');

    await searchInput.fill(query);
    await searchInput.press('Enter');

    await expectUrl(page, '/resources/all/1', { search: query });
    await expect(defaultContent).toBeHidden();
    await expect(searchResults).toBeVisible();
    await expect(summary).toBeVisible();
    await expect(summary).toContainText(`for "${query}"`);

    const summaryText = (await summary.textContent())?.trim() ?? '';
    expect(summaryText).toMatch(/^Showing\s+[1-9]\d*\s+result/);

    const resultCards = searchResults.locator('.resource-card');
    await expect(resultCards.first()).toBeVisible();
    expect(await resultCards.count()).toBeGreaterThan(0);

    await searchInput.fill('');
    await searchInput.press('Enter');

    await expectUrl(page, '/resources/all/1', { search: null });
    await expect(defaultContent).toBeVisible();
    await expect(searchResults).toBeHidden();
  });

  test('impossible query shows zero-result empty state', async ({ page }) => {
    const impossibleQuery = buildImpossibleQuery();
    await page.goto(`/resources/all/1?search=${encodeURIComponent(impossibleQuery)}`);

    const defaultContent = page.locator('[data-resources-default-content]');
    const searchResults = page.locator('[data-resources-search-results]');
    const summary = page.locator('[data-search-summary]');

    await expect(defaultContent).toBeHidden();
    await expect(searchResults).toBeVisible();
    await expect(searchResults).toContainText('No search results found');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText('Showing 0 results');
  });
});

test.describe('TIL static search journey', () => {
  test('redirect preserves search query', async ({ page }) => {
    await page.goto('/til?search=foo');
    await expectUrl(page, '/til/all/1', { search: 'foo' });
  });

  test('query param search renders filtered TIL results', async ({ page }) => {
    await page.goto('/til/all/1');

    const dataset = toTilDataset(await parseDataset<unknown>(page, 'script[data-til-dataset]'));
    expect(dataset.length, 'TIL dataset is empty. Ensure local TIL content is present before running e2e tests.').toBeGreaterThan(0);

    const query = buildGuaranteedHitQuery(dataset[0].title);
    await page.goto(`/til/all/1?search=${encodeURIComponent(query)}`);

    const defaultContent = page.locator('[data-til-default-content]');
    const searchResults = page.locator('[data-til-search-results]');
    const summary = page.locator('[data-search-summary]');

    await expectUrl(page, '/til/all/1', { search: query });
    await expect(defaultContent).toBeHidden();
    await expect(searchResults).toBeVisible();
    await expect(summary).toBeVisible();

    const summaryText = (await summary.textContent())?.trim() ?? '';
    expect(summaryText).toMatch(/^Showing\s+[1-9]\d*\s+result/);

    const resultCards = searchResults.locator('.til-card');
    await expect(resultCards.first()).toBeVisible();
    expect(await resultCards.count()).toBeGreaterThan(0);
  });

  test('impossible query shows zero-result empty state', async ({ page }) => {
    const impossibleQuery = buildImpossibleQuery();
    await page.goto(`/til/all/1?search=${encodeURIComponent(impossibleQuery)}`);

    const defaultContent = page.locator('[data-til-default-content]');
    const searchResults = page.locator('[data-til-search-results]');
    const summary = page.locator('[data-search-summary]');

    await expect(defaultContent).toBeHidden();
    await expect(searchResults).toBeVisible();
    await expect(searchResults).toContainText('No search results found');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText('Showing 0 results');
  });
});
