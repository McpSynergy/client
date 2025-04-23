import { defineConfig } from 'vite'
import dts from "vite-plugin-dts";
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), dts({
    tsconfigPath: './tsconfig.json',
    outDir: 'dist/types',
  }),],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'react',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})