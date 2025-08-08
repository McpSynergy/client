module.exports = {
  apps: [
    {
      name: 'mcp-component-vue-render',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 33402,
        PM2_SERVE_SPA: 'true',
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      watch: false,
      instances: '1',
      exec_mode: 'fork',
    },
  ],
}
