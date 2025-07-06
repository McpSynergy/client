import vue from '@vitejs/plugin-vue';
import { defineConfig, type UserConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

const baseConfig: UserConfig = {
  plugins: [vue()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/index.ts',
      name: 'vue',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
};

if (process.env.BUILD_TYPE === 'static') {
  if (!baseConfig.resolve) {
    baseConfig.resolve = {};
  }
  baseConfig.resolve.alias = {
    'virtual:mcp-comp-vue/imports': fileURLToPath(new URL('./src/empty-imports.ts', import.meta.url)),
    'virtual:mcp-comp-vue/data': fileURLToPath(new URL('./src/empty-data.ts', import.meta.url)),
  };
  (baseConfig as any).build.lib.fileName = 'static';
} else {
  (baseConfig as any).build.rollupOptions.external.push(
    'virtual:mcp-comp-vue/imports',
    'virtual:mcp-comp-vue/data',
  );
}

export default defineConfig(baseConfig); 