import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Mauri_Garage",
        short_name: "Mauri_Garage",
        description: "Catalogo ricambi auto d'epoca e cosmetica auto",
        theme_color: "#ff2800",
        background_color: "#111111",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "favicon.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "favicon.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/photos": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
});
