import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import electron from "vite-plugin-electron";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// 解决ESM中没有__dirname的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: "src/main/main.cjs",
      vite: {
        build: {
          outDir: "dist-electron/main",
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
