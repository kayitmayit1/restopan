import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const baseConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  turbopack: {},
  serverExternalPackages: ["iyzipay"],
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      // Menu API — stale-while-revalidate (garson menüye bakar)
      {
        urlPattern: /^\/api\/menu/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "api-menu",
          expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
        },
      },
      // Tables API — kısa TTL (masa durumu sık değişir)
      {
        urlPattern: /^\/api\/tables/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "api-tables",
          expiration: { maxEntries: 20, maxAgeSeconds: 30 },
        },
      },
      // Public QR menu page — ağırlıklı cache (müşteri offline okuyabilsin)
      {
        urlPattern: /^\/menu\//,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "qr-menu-pages",
          expiration: { maxEntries: 10, maxAgeSeconds: 10 * 60 },
        },
      },
      // Görseller — uzun süreli cache
      {
        urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      // Font dosyaları
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
    ],
  },
})(baseConfig);
