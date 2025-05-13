// import { MCPComp } from '@mcp-synergy/vite-plugin-comp';
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { MCPComp } from "../../packages/vite-plugin-comp/src/index";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), MCPComp()],
  server: {
    proxy: {
      "^/message": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  // for turbo
  clearScreen: false,
});
