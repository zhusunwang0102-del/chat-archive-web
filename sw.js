const CACHE = 'chat-archive-1.0.8-7aaa33932d4df099';
const PREFIX = 'chat-archive-';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('message',event => { if(event.data==='SKIP_WAITING')self.skipWaiting(); });
self.addEventListener('activate',event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event => {
  const url = new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  if(url.pathname.endsWith('/updates.json')||url.pathname.endsWith('.apk'))return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(event.request,{ignoreSearch:true});
    if(cached)return cached;
    if(event.request.mode==='navigate')return (await cache.match('./index.html')) || fetch(event.request);
    return fetch(event.request);
  }));
});
