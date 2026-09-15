import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

async function loadAdminScripts(page, files) {
  await page.route('**/admin-harness', route => route.fulfill({
    contentType:'text/html', body:'<!doctype html><div id="at-panel"></div><div id="breadcrumb"></div>',
  }));
  await page.goto('/admin-harness');
  for (const file of ['admin-core.js', 'admin-state.js', ...files]) {
    await page.addScriptTag({ content:readFileSync(new URL(`../../api/admin/js/${file}`, import.meta.url), 'utf8') });
  }
}

test('nickname confirmation treats quotes and markup as data', async ({ page }) => {
  await loadAdminScripts(page, ['admin-alliances.js']);
  const changes = [
    { name:"O'Brien", otherName:'Name "with quotes"' },
    { name:"x');window.injected=true;//", otherName:'<img src=x onerror="window.injected=true">' },
  ].map(row => ({ ...row, type:'nickname_candidate', memberId:'old-id', otherMemberId:'new-id' }));
  await page.evaluate(changes => {
    window.received = [];
    window.atConfirmRename = (...args) => { window.received.push(args); };
    AT.summary = { changes };
    atRenderChanges();
  }, changes);
  for (const button of await page.getByRole('button', { name:'Confirmar troca' }).all()) await button.click();
  expect(await page.evaluate(() => window.received)).toEqual(changes.map(c => [c.memberId, c.otherMemberId, c.name, c.otherName]));
  expect(await page.evaluate(() => Boolean(window.injected))).toBe(false);
  await expect(page.locator('#at-panel img')).toHaveCount(0);
});

test('breadcrumbs preserve callbacks and escape labels without executable HTML', async ({ page }) => {
  await loadAdminScripts(page, ['admin-shell.js']);
  await page.evaluate(() => {
    const localId = 'dicas';
    setBreadcrumb([
      { label:'<img src=x onerror="window.injected=true">', action:() => { window.clicked = localId; } },
      { label:'Current page' },
    ]);
  });
  await page.locator('#breadcrumb .breadcrumb-item').nth(1).click();
  expect(await page.evaluate(() => window.clicked)).toBe('dicas');
  expect(await page.evaluate(() => Boolean(window.injected))).toBe(false);
  await expect(page.locator('#breadcrumb img')).toHaveCount(0);
});
