import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*.ts', 'src/**/*.d.ts'],
      copyDtsFiles: true,
      insertTypesEntry: true,
    })
  ],
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
