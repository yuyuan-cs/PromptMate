/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// 解决ESM中没有__dirname的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    react(),
  ],
  optimizeDeps: {
    exclude: [
      'fsevents', // macOS 原生文件系统事件模块
      'chokidar', // 文件监听器（可能包含原生依赖）
      // 其他可能的原生模块
      '@parcel/watcher',
      'node-pty',
      'serialport',
    ], // 排除原生模块，不在浏览器环境中处理
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  define: {
    // 定义环境变量来帮助条件编译
    __ELECTRON__: mode === 'electron' ? 'true' : 'false'
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
    // 增加代码块大小警告限制
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: [
        // 将Node.js模块和Electron模块标记为外部依赖
        'fs',
        'path', 
        'events',
        'electron',
        'chokidar',
        'fsevents', // macOS 原生模块
        'util',
        'os',
        'stream',
        // 其他可能的原生模块
        'native-dependencies'
        // sql.js 可以在渲染进程中使用，不需要排除
      ],
      output: {
        globals: {
          // 为外部模块提供全局变量名
          'fs': 'fs',
          'path': 'path',
          'events': 'events',
          'electron': 'electron',
          'chokidar': 'chokidar',
          'fsevents': 'fsevents'
        },
        // 手动分割代码块以优化加载性能
        manualChunks: (id) => {
          // 动态分块策略 - 工作流相关代码单独分块
          if (id.includes('workflow') || id.includes('reactflow') || id.includes('@reactflow')) {
            return 'workflow-plugin';
          }
          
          // 静态分块配置
          const staticChunks = {
          // 将React相关库分离到单独的chunk
          'react-vendor': ['react', 'react-dom'],
          // 将UI组件库分离
          'ui-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip'
          ],
          // 将ReactFlow相关库分离到可选chunk（仅在需要时加载）
          'reactflow-vendor': [
            '@reactflow/background',
            '@reactflow/controls',
            '@reactflow/core',
            '@reactflow/minimap',
            'reactflow'
          ],
          // 将其他工具库分离
          'utils-vendor': [
            'i18next',
            'i18next-browser-languagedetector',
            'react-i18next',
            'date-fns',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'cmdk',
            'lucide-react',
            'sonner',
            'vaul'
          ],
          // 将图表和可视化库分离
          'charts-vendor': [
            'recharts',
            'react-markdown',
            'remark-gfm',
            'rehype-raw',
            'github-markdown-css'
          ]
          };
          
          // 检查是否匹配静态分块
          for (const [chunkName, modules] of Object.entries(staticChunks)) {
            if (modules.some(module => id.includes(module))) {
              return chunkName;
            }
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.names?.[0]?.split('.') || [];
          const ext = info[info.length - 1] || 'unknown';
          if (/\.(css)$/.test(assetInfo.names?.[0] || '')) {
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
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
}));
