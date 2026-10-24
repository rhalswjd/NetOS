import { chromium, devices } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const args = process.argv.slice(2);
const readme = args.includes('--readme');
const base = args.find((arg) => arg !== '--readme') || 'http://127.0.0.1:4323/';
const output = readme ? 'docs/assets/previews' : '/tmp/netos-qa';
const viewports = {
  desktop: { viewport: { width: 1440, height: 1050 } },
  tablet: { viewport: { width: 768, height: 1024 } },
  narrow: { viewport: { width: 320, height: 800 } },
  mobile: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
};
const pages = { home: '', network: 'network/', os: 'os/' };
if (!readme)
  Object.assign(pages, {
    dhcp: 'network/topics/dhcp/',
    archive: 'archive/problems/',
  });
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  for (const [name, options] of Object.entries(
    readme ? { desktop: viewports.desktop } : viewports,
  )) {
    const context = await browser.newContext({
      ...options,
      colorScheme: 'light',
      reducedMotion: 'reduce',
    });
    try {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      for (const [slug, path] of Object.entries(pages)) {
        const response = await page.goto(new URL(path, base).href);
        if (!response?.ok())
          throw new Error(`Cannot capture ${slug}: HTTP ${response?.status()}`);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts.ready);
        if (
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          )
        )
          throw new Error(`Horizontal overflow on ${name} ${slug}`);
        await page.screenshot({
          path: `${output}/${readme ? slug : `${slug}-${name}`}.png`,
          fullPage: !readme,
        });
      }
      if (errors.length) throw new Error(`${name}: ${errors.join('; ')}`);
      console.log(`${name}: snapshots saved to ${output}; no browser errors`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
