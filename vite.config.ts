import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: { proxy: { "/api": "http://127.0.0.1:8788" } },
  preview: { proxy: { "/api": "http://127.0.0.1:8788" } },
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Mémora — Révisions",
        short_name: "Mémora",
        lang: "fr",
        description:
          "Apprends, révise et retiens. Ton compagnon de révision hors connexion.",
        theme_color: "#194e3e",
        background_color: "#f6f7f9",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,json}"],
        maximumFileSizeToCacheInBytes: 4000000,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
});
