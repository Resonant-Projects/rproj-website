import { expect, test, type Page } from '@playwright/test';

const toggle = (page: Page) => page.locator('[data-aw-toggle-menu]');
const nav = (page: Page) => page.locator('#navigation');
const topLevelItems = (page: Page) => page.locator('#navigation .nav-list > .nav-item');
const dropdownButton = (page: Page, label: string) =>
  page.locator('#navigation .nav-link--dropdown', { hasText: label });
const submenuFor = async (page: Page, label: string) =>
  page.locator(`#${await dropdownButton(page, label).getAttribute('aria-controls')}`);

test.describe('mobile navigation menu', () => {
  test.use({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true });

  const openMobileMenu = async (page: Page) => {
    await page.goto('/');
    await expect(nav(page)).toBeHidden();
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(nav(page)).toBeVisible();
  };

  test('tapping a dropdown expands it without closing the menu', async ({ page }) => {
    await openMobileMenu(page);

    const services = dropdownButton(page, 'Services');
    const firstServiceLink = (await submenuFor(page, 'Services')).getByRole('link').first();
    await expect(firstServiceLink).toBeHidden();

    await services.tap();

    await expect(nav(page)).toBeVisible();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(services).toHaveAttribute('aria-expanded', 'true');
    await expect(firstServiceLink).toBeVisible();

    await services.tap();

    await expect(nav(page)).toBeVisible();
    await expect(services).toHaveAttribute('aria-expanded', 'false');
    await expect(firstServiceLink).toBeHidden();
  });

  test('top-level items are evenly spaced and start below the header bar', async ({ page }) => {
    await openMobileMenu(page);

    const boxes = await topLevelItems(page).evaluateAll(items =>
      items.map(item => {
        const { top, bottom } = item.getBoundingClientRect();
        return { top, bottom };
      })
    );
    expect(boxes.length).toBeGreaterThan(2);

    const gaps = boxes.slice(1).map((box, i) => Math.round(box.top - boxes[i].bottom));
    const heights = boxes.map(box => Math.round(box.bottom - box.top));
    expect(new Set(gaps).size).toBe(1);
    expect(new Set(heights).size).toBe(1);

    const navTop = await nav(page).evaluate(el => el.getBoundingClientRect().top);
    expect(boxes[0].top - navTop).toBeLessThan(24);
  });

  test('collapsed submenu links are hidden', async ({ page }) => {
    await openMobileMenu(page);

    const hiddenLinks = page.locator('#navigation .dropdown-menu a');
    const count = await hiddenLinks.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(hiddenLinks.nth(i)).toBeHidden();
    }
  });

  test('menu content scrolls when expanded submenus overflow the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 480 });
    await openMobileMenu(page);

    await dropdownButton(page, 'Services').tap();
    await expect(nav(page)).toHaveCSS('overflow-y', 'auto');

    const lastItem = topLevelItems(page).last();
    await lastItem.scrollIntoViewIfNeeded();
    const [navBottom, itemBottom] = await Promise.all([
      nav(page).evaluate(el => el.getBoundingClientRect().bottom),
      lastItem.evaluate(el => el.getBoundingClientRect().bottom),
    ]);
    expect(itemBottom).toBeLessThanOrEqual(navBottom + 1);
    await expect(page.locator('#header-actions')).toBeInViewport();
  });

  test('the page behind the open menu is hidden, and Escape closes the menu', async ({ page }) => {
    await openMobileMenu(page);
    await expect(page.locator('#main-content')).toBeHidden();
    await expect(page.locator('.skip-links')).toBeHidden();

    // Shift+Tab from the first panel control must not escape to the hidden page or skip links
    await page.locator('#header a').first().focus();
    await page.keyboard.press('Shift+Tab');
    expect(
      await page.evaluate(
        () => document.activeElement?.closest('#header') !== null || document.activeElement === document.body
      )
    ).toBe(true);

    await page.keyboard.press('Escape');

    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle(page)).toBeFocused();
    await expect(nav(page)).toBeHidden();
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('crossing to desktop resets the menu and any open dropdown', async ({ page }) => {
    await openMobileMenu(page);
    await dropdownButton(page, 'Services').tap();

    await page.setViewportSize({ width: 1280, height: 800 });

    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(dropdownButton(page, 'Services')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('the current page is marked', async ({ page }) => {
    await openMobileMenu(page);
    await expect(nav(page).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('desktop navigation menu', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('a dropdown opens on click and closes on an outside click', async ({ page }) => {
    await page.goto('/');
    await expect(toggle(page)).toBeHidden();

    const services = dropdownButton(page, 'Services');
    const firstServiceLink = (await submenuFor(page, 'Services')).getByRole('link').first();

    await services.click();
    await expect(services).toHaveAttribute('aria-expanded', 'true');
    await expect(firstServiceLink).toBeVisible();

    await page.mouse.click(10, 600);
    await expect(services).toHaveAttribute('aria-expanded', 'false');
    await expect(firstServiceLink).toBeHidden();
  });
});
