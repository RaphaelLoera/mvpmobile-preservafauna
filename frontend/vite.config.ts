import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        name: "Preserva Fauna – Felinos da Serra",
        short_name: "Preserva Fauna",
        start_url: "/",
        display: "standalone",
        background_color: "#F8F9F7",
        theme_color: "#1B4332",
        lang: "pt-BR",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      },
      workbox: {
        runtimeCaching: [
          { urlPattern: /^https:\/\/([abc]\.)?tile\.(openstreetmap|opentopomap)\.org\//, handler: "CacheFirst",
            options: { cacheName: "tiles", expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } } },
          { urlPattern: /\/api\/map\/points/, handler: "NetworkFirst", options: { cacheName: "api-points", networkTimeoutSeconds: 4 } },
          { urlPattern: /\/api\/species/, handler: "StaleWhileRevalidate", options: { cacheName: "api-species" } }
        ]
      }
    })
  ],
  server: { proxy: { "/api": { target: "http://localhost:3333", changeOrigin: true, rewrite: p => p.replace(/^\/api/, "") } } }
});
