import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// 解决ESM中没有__dirname的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  define: {
    // 定义环境变量来帮助条件编译
    __ELECTRON__: 'false'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 4096,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false
      }
    },
    rollupOptions: {
      external: [
        // 将Node.js模块和Electron模块标记为外部依赖
        'fs',
        'path', 
        'events',
        'electron',
        'chokidar',
        'util',
        'os',
        'stream'
      ],
      output: {
        globals: {
          // 为外部模块提供全局变量名
          'fs': 'fs',
          'path': 'path',
          'events': 'events',
          'electron': 'electron',
          'chokidar': 'chokidar'
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1] || 'unknown';
          if (/\.(css)$/.test(assetInfo.name || '')) {
            return `assets/[name].[hash].${ext}`;
          }
          return `assets/[name].[hash].${ext}`;
        },
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false, // 不锁定端口，允许自动选择
  }
});
