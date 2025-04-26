import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node18',
    lib: {
      entry: './src/index.ts',
      name: 'vite-plugin-mcp-comp',
      formats: ['es'],
    },
    ssr: true,
    emptyOutDir: true,
  },
});
