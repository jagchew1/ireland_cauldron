import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    proxy: {
      '/health': 'http://localhost:3000',
      '/assets': 'http://localhost:3000',
      '/rooms': 'http://localhost:3000',
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
});
