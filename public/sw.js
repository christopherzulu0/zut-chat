/**
 * Minimal service worker so browsers/extensions requesting /sw.js
 * get a static file instead of hitting the App Router (which triggers Clerk auth errors).
 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
