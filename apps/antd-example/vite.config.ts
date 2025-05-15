// import { MCPComp } from '@mcp-synergy/vite-plugin-comp';
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { MCPComp } from "../../packages/vite-plugin-comp/src/index";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), MCPComp({
    pushConfig: {
      serverUrl: 'http://localhost:3000/api/config',
      projectId: 'antd-example',
      env: 'development',
      headers: {
        "x-signature":
          "f3de0210ee9003d84626476c631ffc0d1ddf0c268696d7d3e2caa5a3b71273b6"
      }
    }
  })],
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
