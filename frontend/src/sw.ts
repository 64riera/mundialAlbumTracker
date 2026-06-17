/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

const apiCachePlugins = [
  new CacheableResponsePlugin({ statuses: [0, 200] }),
];

registerRoute(
  ({ url }) =>
    /\/api\/(sections|stickers|stats)/.test(url.pathname),
  new NetworkFirst({
    cacheName: "api-data",
    plugins: [
      ...apiCachePlugins,
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 86_400 }),
    ],
    networkTimeoutSeconds: 5,
  })
);

registerRoute(
  ({ url }) => /\/api\/matches/.test(url.pathname),
  new NetworkFirst({
    cacheName: "api-matches",
    plugins: [
      ...apiCachePlugins,
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 3_600 }),
    ],
    networkTimeoutSeconds: 5,
  })
);

// --- Push notifications ---

self.addEventListener("push", (event) => {
  const payload = event.data?.json() ?? {};
  const { title = "Mundial 2026", body, tag, data } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/pwa-icon.svg",
      badge: "/pwa-icon.svg",
      tag,
      data,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data?.url as string) ?? "/matches";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
