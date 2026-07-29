import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: Number(process.env.PORT) || 3000,
      strictPort: false,
      proxy: {
        '/api': {
          target: process.env.NOTIFICATION_PORT
            ? `http://localhost:${process.env.NOTIFICATION_PORT}`
            : 'http://localhost:5001',
          changeOrigin: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    optimizeDeps: {
      entries: ['index.html', 'src/**/*.{ts,tsx}'],
    },
  };
});
