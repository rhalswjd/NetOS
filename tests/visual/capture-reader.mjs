import { chromium, devices, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const output = '/tmp/netos-refinements';
await mkdir(output, { recursive: true });
const base = process.argv[2] || 'http://127.0.0.1:4347/';
const browser = await chromium.launch();
for (const [name, options] of Object.entries({
  desktop: { viewport: { width: 1440, height: 1000 } },
  mobile: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
})) {
  const context = await browser.newContext({
    ...options,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(new URL('labs/dhcp-discover/', base).href);
  await page.waitForLoadState('networkidle');
  if (await page.locator('astro-dev-toolbar').count())
    throw new Error('Development toolbar is still injected.');
  await page.locator('.doc-related').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${output}/reader-footer-${name}.png` });
  await page
    .locator('.sl-markdown-content')
    .getByRole('heading', { name: '수행 과정', exact: true })
    .evaluate((el, mobile) => {
      const header = document
        .querySelector('header')
        .getBoundingClientRect().height;
      const summary = mobile
        ? document
            .querySelector('mobile-starlight-toc summary')
            .getBoundingClientRect().height
        : 0;
      window.scrollTo(
        0,
        scrollY + el.getBoundingClientRect().top - header - summary - 38,
      );
    }, name === 'mobile');
  const toc = page.locator(
    name === 'mobile' ? 'mobile-starlight-toc' : 'starlight-toc',
  );
  await expect(
    toc.locator('a').filter({ hasText: '수행 과정' }),
  ).toHaveAttribute('aria-current', 'true');
  await expect(toc.locator('a[aria-current="true"] > span')).toHaveCSS(
    'transform',
    /matrix\(1\.1/,
  );
  await page.screenshot({ path: `${output}/toc-${name}.png` });
  await page.goto(new URL('archive/concepts/', base).href);
  await page.screenshot({ path: `${output}/filters-${name}.png` });
  await page.goto(base);
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${output}/home-footer-${name}.png` });
  console.log(
    `${name}: no dev toolbar; browser errors: ${errors.length ? errors.join('; ') : 'none'}`,
  );
  await context.close();
}
await browser.close();
