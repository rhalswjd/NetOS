import { test, expect } from '@playwright/test';
import { networkLayers, osAreas, documentTypes } from '../../src/lib/taxonomy';
import { siteContact } from '../../src/config/contact';
const go = (path: string) => path.replace(/^\//, '');

test('public footer contacts work safely on custom and reader pages', async ({
  page,
  context,
}) => {
  // Keep CI independent of GitHub and never open or send mail from a test.
  await context.route(siteContact.githubUrl, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<h1>Repository</h1>' }),
  );
  for (const path of ['./', go('/network/topics/dhcp/')]) {
    await page.goto(path);
    const github = page.locator('.footer-contacts a[data-contact="github"]');
    const email = page.locator('.footer-contacts a[data-contact="email"]');
    await expect(github).toHaveAttribute('href', siteContact.githubUrl);
    await expect(github).toHaveAttribute('target', '_blank');
    await expect(github).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(email).toHaveAttribute('href', `mailto:${siteContact.email}`);
    const handoff = page.evaluate(
      () =>
        new Promise<string>((resolve) => {
          document
            .querySelector('.footer-contacts a[data-contact="email"]')!
            .addEventListener(
              'click',
              (event) => {
                event.preventDefault();
                resolve((event.currentTarget as HTMLAnchorElement).href);
              },
              { once: true },
            );
        }),
    );
    await email.click();
    expect(await handoff).toBe(`mailto:${siteContact.email}`);
    const popupOpened = page.waitForEvent('popup');
    await github.click();
    const popup = await popupOpened;
    await expect(popup).toHaveURL(siteContact.githubUrl);
    await expect(popup.locator('h1')).toHaveText('Repository');
    expect(await popup.evaluate(() => window.opener)).toBeNull();
    await popup.close();
  }
});

test('home floating cards and all four archive entries navigate', async ({
  page,
  isMobile,
}) => {
  await page.goto('./');
  await expect(page.locator('.subject-card')).toHaveCount(2);
  await expect(page.locator('.archive-entries a')).toHaveCount(4);
  const activateFloating = async (selector: string) => {
    const box = await page.locator(selector).boundingBox();
    if (!box) throw new Error('Floating card is not visible');
    const x = box.x + box.width / 2,
      y = box.y + box.height / 2;
    if (isMobile) await page.touchscreen.tap(x, y);
    else {
      await page.mouse.move(x, y);
      await page.locator(selector).click();
    }
  };
  await activateFloating('.network-card');
  await expect(page).toHaveURL(/\/network\/$/);
  await page.goBack();
  await page
    .locator('.os-card')
    .evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await activateFloating('.os-card');
  await expect(page).toHaveURL(/\/os\/$/);
  for (const type of documentTypes) {
    await page.goto('./');
    await page
      .locator(`.archive-entries a[href$="/archive/${type.slug}/"]`)
      .click();
    await expect(
      page.getByRole('heading', { name: type.label, exact: true }),
    ).toBeVisible();
  }
});
test('exactly seven semantic OSI cylinders reach the correct hubs', async ({
  page,
}) => {
  await page.goto(go('/network/'));
  await expect(page.locator('.osi-layer')).toHaveCount(7);
  for (const layer of networkLayers) {
    const link = page.getByRole('link', {
      name: `L${layer.number} — ${layer.name}`,
      exact: true,
    });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/network/layers/${layer.id}/$`));
    await expect(
      page.getByRole('heading', { name: layer.name, exact: true }),
    ).toBeVisible();
    await page.goBack();
  }
});
test('keyboard and touch activation follow real links', async ({
  page,
  isMobile,
}) => {
  await page.goto(go('/network/'));
  const link = page.getByRole('link', {
    name: 'L7 — Application',
    exact: true,
  });
  if (isMobile) await link.tap();
  else {
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect(page).toHaveURL(/\/network\/layers\/l7\/$/);
});
test('OS architecture, all subsystem hubs and topics fallback work', async ({
  page,
}) => {
  await page.goto(go('/os/'));
  await expect(page.locator('#architecture')).toBeVisible();
  await expect(page.locator('.kernel-area')).toHaveCount(8);
  for (const area of osAreas) {
    await page.locator(`.kernel-area[href$="/os/areas/${area.id}/"]`).click();
    await expect(
      page.getByRole('heading', { name: area.name, exact: true, level: 1 }),
    ).toBeVisible();
    await page.goBack();
  }
  await page.getByRole('button', { name: 'Topics', exact: true }).click();
  await expect(page.locator('#topics')).toBeVisible();
  await expect(page.locator('#architecture')).toBeHidden();
  await page
    .locator('#topics')
    .getByRole('link')
    .filter({ hasText: 'Processes & Threads' })
    .click();
  await page
    .locator('.hub-content')
    .getByRole('link')
    .filter({ hasText: '프로세스 격리' })
    .click();
  await expect(page.locator('h1')).toHaveText('Processes & Threads');
});
test('DHCP has automatic related content and a rendered Mermaid diagram', async ({
  page,
  context,
}) => {
  await page.goto(go('/network/topics/dhcp/'));
  await expect(
    page
      .locator('.doc-related')
      .getByRole('link')
      .filter({ hasText: 'DHCP Discover' }),
  ).toBeVisible();
  await expect(
    page
      .locator('.doc-related')
      .getByRole('link')
      .filter({ hasText: '초기 Discover' }),
  ).toBeVisible();
  await expect(
    page
      .locator('.doc-related')
      .getByRole('link')
      .filter({ hasText: 'DHCP DORA' }),
  ).toBeVisible();
  await expect(page.locator('pre.mermaid svg')).toBeVisible({ timeout: 20000 });
  const diagramId = await page.locator('pre.mermaid svg').getAttribute('id');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('pre.mermaid svg')).toBeVisible();
  await expect(page.locator('pre.mermaid svg')).not.toHaveAttribute(
    'id',
    diagramId!,
  );
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page
    .locator('.doc-related')
    .getByRole('link')
    .filter({ hasText: 'DHCP Discover' })
    .click();
  await expect(page.locator('.sl-markdown-content')).toContainText(
    '실험 미수행',
  );
  await page.getByTitle('Copy to clipboard').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'udp.port == 67 || udp.port == 68',
  );
  await expect(
    page
      .locator('.doc-related')
      .getByRole('link')
      .filter({
        has: page.getByRole('heading', { name: 'DHCP', exact: true }),
      }),
  ).toBeVisible();
});
test('problem answers start hidden and can be opened by keyboard', async ({
  page,
}) => {
  await page.goto(go('/problems/dhcp-dora/'));
  const details = page.locator('.sl-markdown-content details');
  await expect(details).not.toHaveAttribute('open');
  await expect(page.getByText('정답: B', { exact: true })).toBeHidden();
  await details.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open', '');
  await expect(page.getByText('정답: B', { exact: true })).toBeVisible();
  await page.goto(go('/problems/context-switch/'));
  await expect(
    page.locator('.sl-markdown-content details'),
  ).not.toHaveAttribute('open');
});
test('archive search, subjects, categories, tags, sorts and empty states', async ({
  page,
}) => {
  await page.goto(go('/archive/concepts/'));
  await page
    .getByRole('combobox', { name: 'Subject', exact: true })
    .selectOption('os');
  await expect(page.locator('[data-document-card]:visible')).toHaveCount(2);
  await page
    .getByRole('combobox', { name: 'Category', exact: true })
    .selectOption('processes');
  await expect(page.locator('[data-document-card]:visible')).toHaveCount(1);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByLabel('Search concepts').fill('DHCP');
  await expect(page.locator('[data-document-card]:visible')).toHaveCount(1);
  await page.getByLabel('Search concepts').fill('no-document-could-match-this');
  await expect(
    page.getByRole('heading', { name: 'No matching documents' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page
    .getByRole('combobox', { name: 'Tag', exact: true })
    .selectOption('UDP');
  await expect(page.locator('[data-document-card]:visible')).toHaveCount(2);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page
    .getByRole('combobox', { name: 'Sort by', exact: true })
    .selectOption('title');
  const titles = await page
    .locator('[data-document-card]:visible h3')
    .allTextContents();
  expect(titles).toEqual(
    [...titles].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
  );
  await page.reload();
  await expect(
    page.getByRole('combobox', { name: 'Sort by', exact: true }),
  ).toHaveValue('title');
  await page.goto(go('/archive/problems/'));
  await page
    .getByRole('combobox', { name: 'Difficulty', exact: true })
    .selectOption('medium');
  await page
    .getByRole('combobox', { name: 'Problem type', exact: true })
    .selectOption('explanation');
  await expect(page.locator('[data-document-card]:visible')).toHaveCount(1);
});
test('static full-text search finds body text on custom and reader pages', async ({
  page,
}) => {
  for (const path of ['./', go('/network/topics/dhcp/')]) {
    await page.goto(path);
    await page
      .getByRole('button', { name: 'Search knowledge archive' })
      .click();
    await page
      .getByRole('searchbox', { name: 'Search all documents' })
      .fill('MMU');
    await expect(page.locator('.search-results a').first()).toBeVisible({
      timeout: 15000,
    });
    await page.locator('.search-results a').first().click();
    await expect(page.locator('h1')).toBeVisible();
  }
});
test('dark mode, reduced motion and mobile layout are functional', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of [
    './',
    go('/network/'),
    go('/os/'),
    go('/archive/problems/'),
    go('/network/topics/dhcp/'),
  ]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
    await expect(page.locator('.theme-toggle')).toBeVisible();
  }
  await page.goto('./');
  expect(
    await page
      .locator('.float-wrap')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('the current table-of-contents label grows and resets as sections change', async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(go('/network/topics/dhcp/'));
  const toc = page.locator(isMobile ? 'mobile-starlight-toc' : 'starlight-toc');
  // Measure the visible dropdown; hidden details can suspend CSS transitions.
  if (isMobile) await toc.locator('summary').click();
  const first = toc.locator('nav a').filter({ hasText: '왜 필요한가?' });
  const second = toc.locator('nav a').filter({ hasText: '동작 과정' });
  const scrollToSection = async (name: string) => {
    await page
      .locator('.sl-markdown-content')
      .getByRole('heading', { name, exact: true })
      .evaluate((heading, mobile) => {
        const header = document
          .querySelector('header')!
          .getBoundingClientRect().height;
        const summary = mobile
          ? document
              .querySelector('mobile-starlight-toc summary')!
              .getBoundingClientRect().height
          : 0;
        const offset = header + summary + 38;
        window.scrollTo({
          top: scrollY + heading.getBoundingClientRect().top - offset,
          behavior: 'instant',
        });
      }, isMobile);
  };
  await scrollToSection('왜 필요한가?');
  await expect(first).toHaveAttribute('aria-current', 'true');
  await expect(first.locator('span')).toHaveCSS('transform', /matrix\(1\.1/);
  await scrollToSection('동작 과정');
  await expect(second).toHaveAttribute('aria-current', 'true');
  await expect(second.locator('span')).toHaveCSS('transform', /matrix\(1\.1/);
  await expect(first).not.toHaveAttribute('aria-current', 'true');
  await expect(first.locator('span')).toHaveCSS('transform', 'none');
});

test('reader spacing, heading permalinks and pagination typography remain comfortable', async ({
  page,
}) => {
  await page.goto(go('/labs/dhcp-discover/'));
  const group = page.locator('.doc-related .content-group').first();
  const heading = await group.locator('.section-heading').boundingBox();
  const cards = await group.locator('.document-grid').boundingBox();
  expect(cards!.y - (heading!.y + heading!.height)).toBeGreaterThanOrEqual(16);
  const title = page.locator('.pagination-links .link-title').first();
  expect(
    await title.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeLessThanOrEqual(18);
  const wrapper = page
    .locator('.sl-markdown-content .sl-heading-wrapper')
    .first();
  const gap = await wrapper.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el.querySelector('h2')!);
    return (
      el.querySelector('.sl-anchor-icon svg')!.getBoundingClientRect().left -
      range.getBoundingClientRect().right
    );
  });
  expect(gap).toBeGreaterThanOrEqual(8);
  await expect(page.locator('.reader-footer .footer-contacts')).toContainText(
    'GitHub',
  );
  await expect(page.locator('.reader-footer .footer-contacts')).toContainText(
    'Email',
  );
});
