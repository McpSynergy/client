import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { MCPCompVue } from '../../packages/vite-plugin-comp-vue/src/index'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    MCPCompVue({
      debug: true, // 启用调试模式
      componentPropSchemaOutputPath: 'mcp-comp-vue-schema.json',
      pushConfig: {
        serverUrl: 'http://localhost:3000/api/config',
        projectId: 'vue3-exmplate',
        env: 'development',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
