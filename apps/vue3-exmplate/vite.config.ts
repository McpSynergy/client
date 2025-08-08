import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { MCPCompVue } from '@mcp-synergy/vite-plugin-comp-vue'

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
        headers: {
          "x-signature":
            "f3de0210ee9003d84626476c631ffc0d1ddf0c268696d7d3e2caa5a3b71273b6"
        }
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
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
