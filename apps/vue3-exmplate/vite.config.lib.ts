import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { MCPCompVue } from '../../packages/vite-plugin-comp-vue/src/index'
import path, { dirname } from 'node:path'
import replace from '@rollup/plugin-replace'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isVue2 = process.env.VUE_VERSION === '2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    MCPCompVue({
      debug: false,
      componentPropSchemaOutputPath: 'mcp-comp-vue-schema.json',
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.VUE_VERSION': JSON.stringify(process.env.VUE_VERSION),
      preventAssignment: true
    })
  ],
  build: {
    cssCodeSplit: false, // 禁用 CSS 代码分割，将所有 CSS 打包到一个文件
    lib: {
      entry: path.resolve(__dirname, 'src/components/index.ts'),
      name: 'vue-ai-components',
      fileName: (format) => `vue-app-components.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'vue-router', '@vue/composition-api', 'vue-demi'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-demi': 'VueDemi',
          '@vue/composition-api': 'VueCompositionAPI'
        },
        // 确保将 CSS 文件打包进来
        assetFileNames: (assetInfo) => {
          if (assetInfo.type === 'asset' && assetInfo.source && assetInfo.source.toString().includes('.css')) {
            return 'vue-app-components.css';
          }
          return '[name][extname]';
        },
        // 确保所有依赖都被打包进来
        manualChunks: undefined
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: isVue2 ? 'vue2' : 'vue'
    },
  },
  optimizeDeps: {
    include: ['tdesign-vue-next', '@tdesign-vue-next/chat']
  },
  server: {
    proxy: {
      "^/message": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
})
