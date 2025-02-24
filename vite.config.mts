import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import eslint from "vite-plugin-eslint";
import Pages from "vite-plugin-pages";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src",
  envDir: "../",
  plugins: [
    react(),
    eslint(),
    Pages({
      pagesDir: [{ dir: "pages", baseRoute: "" }],
      extensions: ["tsx"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api/internal/v1": {
        target: "http://localhost:5000/",
        changeOrigin: false,
        secure: false,
        //rewrite: (path) => path.replace(/^\/api\/v1/, ""),
      },
      "/api/v1": {
        target: "http://localhost:5000/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/v1/, ""),
      },
    },
    port: 9000,
  },
  build: {
    outDir: "../.local/vite/dist",
    assetsDir: "assets",
    sourcemap: true,
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
