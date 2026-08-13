import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

async function walk(dir) {
  const names = await readdir(dir);
  const out = [];
  for (const name of names) {
    if (name === 'sw.js') continue;
    const full = join(dir, name);
    const info = await stat(full);
    if (info.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}

const distPath = dist.pathname;
const files = await walk(distPath);
const precache = files
  .map(file => '/' + relative(distPath, file).split(sep).join('/'))
  .filter(path => !path.endsWith('.map'));

if (!precache.includes('/index.html')) precache.unshift('/index.html');
precache.unshift('/');

const cacheName = `guiadoa-${pkg.version}`;
const sw = `const CACHE_NAME = ${JSON.stringify(cacheName)};
const PRECACHE = ${JSON.stringify([...new Set(precache)], null, 2)};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
`;

await writeFile(new URL('../dist/sw.js', import.meta.url), sw, 'utf8');
console.log(`[PWA] service worker nativo gerado: ${cacheName} · ${precache.length} arquivos`);
