import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ── User Service (8081) ───────────────────────────────────────────
      '/user': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/user/, ''),
      },
      // ── Learning Service (8082) ───────────────────────────────────────
      '/learning': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/learning/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // ── Analytics Service (8083) ──────────────────────────────────────
      '/analytics': {
        target: 'http://127.0.0.1:8083',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/analytics/, ''),
      },
    },
  },
})

