import { test, expect } from '@playwright/test';

for (const width of [320, 390, 640, 768, 900, 1280, 1440]) {
  test(`mascot navigation at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'AI writes the code.QualityMax verifies it.',
    );
    const nav = page.getByRole('navigation', { name: 'All destinations' });
    await expect(nav.getByRole('link')).toHaveCount(12);
    await expect(page.getByAltText(/Max, the black/)).toBeVisible();
    await expect(page.getByAltText(/Max, the black/)).toHaveJSProperty(
      'naturalWidth',
      1145,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width >= 900) {
      await expect(page.locator('.qmax-leaders line')).toHaveCount(12);
      const callouts = await page.locator('.qmax-callout').evaluateAll(nodes =>
        nodes.map(node => {
          const rect = node.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          };
        }),
      );
      for (let i = 0; i < callouts.length; i++) {
        expect(callouts[i].left).toBeGreaterThanOrEqual(0);
        expect(callouts[i].right).toBeLessThanOrEqual(width);
        for (let j = i + 1; j < callouts.length; j++) {
          const a = callouts[i],
            b = callouts[j];
          expect(
            a.right <= b.left ||
              b.right <= a.left ||
              a.bottom <= b.top ||
              b.bottom <= a.top,
          ).toBe(true);
        }
      }
    } else {
      await expect(page.locator('.qmax-callout-slot').first()).toBeHidden();
    }
    const demo = nav.getByRole('link', { name: /Book a QualityMax demo/ });
    await demo.focus();
    await expect(demo).toBeFocused();
    expect(
      await demo.evaluate(node => getComputedStyle(node).outlineStyle),
    ).toBe('solid');
    await page
      .context()
      .route('https://www.youtube.com/**', route =>
        route.fulfill({ body: 'Destination reached' }),
      );
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Forehead: YouTube' }).click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(/youtube\.com\/@Quality-Max-dev/);
    await popup.close();
    expect(errors).toEqual([]);
  });
}

test('text navigation works with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://localhost:3003/');
  await expect(
    page
      .getByRole('navigation', { name: 'All destinations' })
      .getByRole('link'),
  ).toHaveCount(12);
  await expect(
    page.getByRole('link', { name: 'Collar tag: QualityMax' }),
  ).toHaveAttribute('href', 'https://qualitymax.io/');
  await context.close();
});

test('image failure preserves the twelve text destinations', async ({
  page,
}) => {
  await page.route('**/qualitymax/max.webp', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText(
    'Every destination is still linked below',
  );
  await expect(
    page
      .getByRole('navigation', { name: 'All destinations' })
      .getByRole('link'),
  ).toHaveCount(12);
});
