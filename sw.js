/* 321健康新生活 — 离线快取 Service Worker
   更新 App 后，把下面的版本号改一下（例如 v17 → v18），
   使用者重新开启时就会自动下载最新版。 */
const CACHE = '321health-v21';
const ASSETS = ['./', './index.html'];

// 安装：预先快取首页
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).catch(function () {})
  );
});

// 启用：清掉旧版本快取
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) { return caches.delete(k); }
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

// 取用：先回快取（离线可用），同时背景更新
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') { return; }
  e.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
