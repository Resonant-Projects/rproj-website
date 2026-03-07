import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __afterSwapCount?: number;
    __lastSwapSnapshot?: {
      fontPrimary: string;
      colorBackground: string;
      themeNodeCount: number;
    };
    __transitionMarker?: string;
  }
}

const installNavigationProbe = async (page: Page): Promise<string> => {
  return page.evaluate(() => {
    window.__transitionMarker = crypto.randomUUID();
    window.__afterSwapCount = 0;

    document.addEventListener('astro:after-swap', () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const themeNodeCount = document.head.querySelectorAll('link[data-theme-styles]').length;

      window.__afterSwapCount = (window.__afterSwapCount ?? 0) + 1;
      window.__lastSwapSnapshot = {
        fontPrimary: rootStyles.getPropertyValue('--font-family-primary').trim(),
        colorBackground: rootStyles.getPropertyValue('--color-background').trim(),
        themeNodeCount,
      };
    });

    return window.__transitionMarker;
  });
};

const readHeadState = async (page: Page) => {
  return page.evaluate(() => {
    const themeNode = document.head.querySelector('link[data-theme-styles]');
    const rootStyles = getComputedStyle(document.documentElement);

    return {
      afterSwapCount: window.__afterSwapCount ?? 0,
      colorBackground: rootStyles.getPropertyValue('--color-background').trim(),
      fontPrimary: rootStyles.getPropertyValue('--font-family-primary').trim(),
      lastSwapSnapshot: window.__lastSwapSnapshot ?? null,
      marker: window.__transitionMarker ?? null,
      themeNodeId: themeNode instanceof HTMLLinkElement ? themeNode.href : null,
      themeNodePresent: Boolean(themeNode),
    };
  });
};

const clickAndWait = async (page: Page, selector: string, expectedPath: string): Promise<void> => {
  await page.locator(selector).first().click();
  await expect(page).toHaveURL(new RegExp(`${expectedPath}/?$`));
};

test.describe('View transitions keep stable head styles mounted', () => {
  test('client navigation preserves theme stylesheet and root tokens', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts?.ready);

    const marker = await installNavigationProbe(page);
    const initialState = await readHeadState(page);

    expect(initialState.marker).toBe(marker);
    expect(initialState.themeNodePresent).toBe(true);
    expect(initialState.themeNodeId).toContain('theme');
    expect(initialState.fontPrimary).toContain('Source Sans 3 Variable');
    expect(initialState.colorBackground).not.toBe('');

    await clickAndWait(page, 'a[href="/about"]', '/about');

    const aboutState = await readHeadState(page);
    expect(aboutState.marker).toBe(marker);
    expect(aboutState.afterSwapCount).toBe(1);
    expect(aboutState.themeNodePresent).toBe(true);
    expect(aboutState.themeNodeId).toBe(initialState.themeNodeId);
    expect(aboutState.lastSwapSnapshot?.themeNodeCount).toBeGreaterThan(0);
    expect(aboutState.lastSwapSnapshot?.fontPrimary).toContain('Source Sans 3 Variable');
    expect(aboutState.lastSwapSnapshot?.colorBackground).not.toBe('');

    await clickAndWait(page, 'footer a[href="/services/rhythm"]', '/services/rhythm');

    const rhythmState = await readHeadState(page);
    expect(rhythmState.marker).toBe(marker);
    expect(rhythmState.afterSwapCount).toBe(2);
    expect(rhythmState.themeNodePresent).toBe(true);
    expect(rhythmState.themeNodeId).toBe(initialState.themeNodeId);
    expect(rhythmState.lastSwapSnapshot?.themeNodeCount).toBeGreaterThan(0);
    expect(rhythmState.lastSwapSnapshot?.fontPrimary).toContain('Source Sans 3 Variable');
    expect(rhythmState.lastSwapSnapshot?.colorBackground).not.toBe('');
  });
});
