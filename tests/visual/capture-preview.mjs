import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();
const base = process.argv[2] || 'http://127.0.0.1:4323/';
for (const [name, options] of Object.entries({
  desktop: { viewport: { width: 1440, height: 1050 } },
  tablet: { viewport: { width: 768, height: 1024 } },
  narrow: { viewport: { width: 320, height: 800 } },
  mobile: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
})) {
  const context = await browser.newContext({
    ...options,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const [slug, path] of Object.entries({
    home: '',
    network: 'network/',
    os: 'os/',
    dhcp: 'network/topics/dhcp/',
    archive: 'archive/problems/',
  })) {
    await page.goto(new URL(path, base).href);
    await page.waitForLoadState('networkidle');
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      )
    )
      throw new Error(`Horizontal overflow on ${name} ${slug}`);
    await page.screenshot({
      path: `/tmp/netos-qa/${slug}-${name}.png`,
      fullPage: true,
    });
  }
  console.log(
    `${name}: snapshots captured; browser errors: ${errors.length ? errors.join('; ') : 'none'}`,
  );
  await context.close();
}
await browser.close();
