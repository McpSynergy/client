import react from "@vitejs/plugin-react";
import { defineConfig, type UserConfig } from "vite";

const baseConfig: UserConfig = {
  // @ts-ignore
  plugins: [react()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/index.ts",
      name: "react",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    outDir: "dist",
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
};

if (process.env.BUILD_TYPE === "static") {
  if (!baseConfig.resolve) {
    baseConfig.resolve = {};
  }
  baseConfig.resolve.alias = {
    "virtual:mcp-comp/imports": "src/empty-imports.ts",
  };
  (baseConfig as any).build.lib.fileName = "static";
} else {
  (baseConfig as any).build.rollupOptions.external.push(
    "virtual:mcp-comp/imports",
    "virtual:mcp-comp/data.json",
  );
}

export default defineConfig(baseConfig);
