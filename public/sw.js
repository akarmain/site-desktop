self.addEventListener('install', function () {
	self.skipWaiting()
})

self.addEventListener('activate', function (event) {
	event.waitUntil((async function () {
		await self.clients.claim()

		if (self.caches) {
			const keys = await caches.keys()
			await Promise.all(keys.map(function (key) {
				return caches.delete(key)
			}))
		}

		await self.registration.unregister()

		const windows = await self.clients.matchAll({
			type: 'window',
			includeUncontrolled: true,
		})

		await Promise.all(windows.map(function (client) {
			return client.navigate(client.url)
		}))
	})())
})
