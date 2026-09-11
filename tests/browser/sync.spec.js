import { test, expect } from '@playwright/test';

const fixture = '/tests/browser/fixtures/sync.html';
const oldTroop = { id:'cached', nome:'Cached test record' };
const newTroop = { id:'online', nome:'Updated test record' };
const state = page => page.locator('#state').textContent().then(JSON.parse);

async function seedCache(page) {
  await page.addInitScript(tropa => {
    localStorage.setItem('game-data-v1', JSON.stringify({
      schema:1, updatedAt:'2020-01-01T00:00:00.000Z', data:{ tropas:[tropa] },
    }));
  }, oldTroop);
}

async function mockApi(page) {
  const backend = { offline:false, failedModule:'', healthGate:null, requests:[] };
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    backend.requests.push(path);
    if (backend.offline) return route.abort('internetdisconnected');
    if (path === '/api/health' && backend.healthGate) await backend.healthGate;
    const payload = path === '/api/tropas/todas' ? [newTroop]
      : path === '/api/niveis/todas' ? []
      : { [path.split('/').pop()]:[] };
    await route.fulfill({ status:path === backend.failedModule ? 503 : 200, json:payload }).catch(() => {});
  });
  return backend;
}

test('first launch renders the shell while the backend wakes up', async ({ page }) => {
  const backend = await mockApi(page);
  let release;
  backend.healthGate = new Promise(resolve => { release = resolve; });
  await page.goto(fixture);
  await expect(page.getByRole('heading', { name:'Shell ready' })).toBeVisible();
  await expect.poll(async () => (await state(page)).loading).toBe(true);
  expect((await state(page)).hasData).toBe(false);
  release();
  await expect.poll(async () => (await state(page)).dataSource).toBe('online');
  expect((await state(page)).tropas).toEqual([newTroop]);
});

test('stale cache survives offline startup and refreshes when connection returns', async ({ page }) => {
  await seedCache(page);
  const backend = await mockApi(page);
  backend.offline = true;
  await page.goto(fixture);
  await expect.poll(async () => (await state(page)).code).toBe('GD-NET-001');
  expect((await state(page)).tropas).toEqual([oldTroop]);
  expect((await state(page)).dataSource).toBe('cache');
  backend.offline = false;
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect.poll(async () => (await state(page)).dataSource).toBe('online');
  await expect.poll(async () => (await state(page)).loading).toBe(false);
  expect((await state(page)).retryAttempt).toBe(0);
  backend.offline = true;
  await page.reload();
  await expect.poll(async () => (await state(page)).code).toBe('GD-NET-001');
  expect((await state(page)).tropas).toEqual([newTroop]);
});

test('a failed module keeps the previous complete snapshot until manual recovery', async ({ page }) => {
  await seedCache(page);
  const backend = await mockApi(page);
  backend.failedModule = '/api/dragoes';
  await page.goto(fixture);
  await expect.poll(async () => (await state(page)).code).toBe('GD-SRV-001');
  expect((await state(page)).tropas).toEqual([oldTroop]);
  expect((await state(page)).lastUpdated).toBe('2020-01-01T00:00:00.000Z');
  backend.failedModule = '';
  await page.getByRole('button', { name:'Sync', exact:true }).click();
  await expect.poll(async () => (await state(page)).dataSource).toBe('online');
  expect((await state(page)).tropas).toEqual([newTroop]);
});

test('manual sync, online and language changes do not start overlapping requests', async ({ page }) => {
  const backend = await mockApi(page);
  let release;
  backend.healthGate = new Promise(resolve => { release = resolve; });
  await page.goto(fixture);
  await expect.poll(() => backend.requests.length).toBe(1);
  const shared = await page.evaluate(() => {
    const first = window.syncTest.refresh();
    const second = window.syncTest.refresh();
    window.dispatchEvent(new Event('online'));
    window.syncTest.setLocale('en-US');
    return first === second;
  });
  expect(shared).toBe(true);
  release();
  await expect.poll(async () => (await state(page)).loading).toBe(false);
  expect(backend.requests.filter(path => path === '/api/health')).toHaveLength(1);
  expect(backend.requests.filter(path => path === '/api/tropas/todas')).toHaveLength(1);
});

test('temporary server errors recover through the automatic backoff', async ({ page }) => {
  await page.clock.install();
  const backend = await mockApi(page);
  backend.failedModule = '/api/health';
  await page.goto(fixture);
  await expect.poll(async () => (await state(page)).code).toBe('GD-SRV-001');
  backend.failedModule = '';
  await page.clock.fastForward(5000);
  await expect.poll(async () => (await state(page)).dataSource).toBe('online');
  expect(backend.requests.filter(path => path === '/api/health')).toHaveLength(2);
});

test('an unresponsive IndexedDB open cannot prevent fallback and API recovery', async ({ page }) => {
  await seedCache(page);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', { value:{ open:() => ({}) }, configurable:true });
  });
  const backend = await mockApi(page);
  backend.offline = true;
  await page.goto(fixture);
  await expect(page.getByRole('heading', { name:'Shell ready' })).toBeVisible();
  await expect.poll(async () => (await state(page)).code).toBe('GD-NET-001');
  expect((await state(page)).tropas).toEqual([oldTroop]);
  backend.offline = false;
  await page.getByRole('button', { name:'Sync', exact:true }).click();
  await expect.poll(async () => (await state(page)).loading).toBe(false);
  expect((await state(page)).tropas).toEqual([newTroop]);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('game-data-v1')));
  expect(saved.data.tropas).toEqual([newTroop]);
});

test('a late initial cache read cannot replace a successful manual sync', async ({ page }) => {
  await page.addInitScript(tropa => {
    const open = indexedDB.open.bind(indexedDB);
    let first = true;
    indexedDB.open = (...args) => {
      if (!first) return open(...args);
      first = false;
      const request = {};
      window.releaseInitialCache = () => {
        request.result = {
          close() {},
          transaction:() => ({
            objectStore:() => ({
              get:() => {
                const read = {};
                queueMicrotask(() => {
                  read.result = { schema:1, updatedAt:'2020-01-01T00:00:00.000Z', data:{ tropas:[tropa] } };
                  read.onsuccess();
                });
                return read;
              },
            }),
          }),
        };
        request.onsuccess();
      };
      return request;
    };
  }, oldTroop);
  const backend = await mockApi(page);
  await page.goto(fixture);
  await page.getByRole('button', { name:'Sync', exact:true }).click();
  await expect.poll(async () => (await state(page)).dataSource).toBe('online');
  await page.evaluate(async () => {
    window.releaseInitialCache();
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect((await state(page)).dataSource).toBe('online');
  expect((await state(page)).tropas).toEqual([newTroop]);
  expect(backend.requests.filter(path => path === '/api/health')).toHaveLength(1);
});
