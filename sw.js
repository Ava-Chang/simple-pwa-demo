const filesToCache = [
	'/',
	'/index.html'
];

const cacheName = 'static-v1';

// install
self.addEventListener('install', event => {
	// 這裡的 event 就是 install 的 event
	console.log('installing…');
	event.waitUntil(
		caches.open(cacheName).then(cache => {
			console.log('caching app ok');
			return cache.addAll(filesToCache);
		})
	);
});

// 如何清除舊的 Cache? activate 會去handle fetches
// activate
self.addEventListener('activate', event => {
	console.log('now ready to handle fetches!');
	// 進到 activate 事件之後，一定要執行 event.waitUntil();
	// 這個方法會等 caches.keys().then 執行結束後 activate 的 event 才會真的結束。
	event.waitUntil(
		// caches.keys()負責把所有cacheName取出來, 會回傳string Array["cacheName", "..."]
		caches.keys().then(function (cacheNames) {
			var promiseArr = cacheNames.map(function (item) {
				if (item !== cacheName) {
					console.log(item, cacheName)
					// Delete that cached file
					return caches.delete(item);
				}
			})
			// 等promiseArr所有promise結束後才執行回傳動作
			return Promise.all(promiseArr);
		})
	); // end e.waitUntil
});

// 去判斷 Request 有沒有被 cached ? 做對應處理如下，確保網站能夠離線運作。
// 如果已經被 cached：則回傳 cache 裡的 Response
// 若沒有被 cached：則進行 cache 的動作再回傳 Response
// fetch
self.addEventListener('fetch', event => {
	console.log('now fetch!');
	console.log('event.request:', event.request);
	console.log('[ServiceWorker] Fetch', event.request.url);
	const dataUrl = 'http://localhost:3000';
	// Request 要透過 respondWith 方法才能將 response 回傳給網頁
	event.respondWith(
		caches.match(event.request).then(function (response) {
			console.log('fetch response', response);
			return response || fetch(event.request).then(res =>
				// 存cache之前要先打開 caches.open(dataCacheName)
				caches.open(cacheName)
				.then(function (cache) {
					// cache.put(key, value)
					// 下次caches.match會對應到even.request
					cache.put(event.request, res.clone());
					return res;
				})
			)
		})
	);
});