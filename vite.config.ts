import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project under /<repo>/, so build asset URLs must be
// prefixed. Override with BASE_PATH for other hosts (e.g. a custom domain).
export default defineConfig({
  base: process.env.BASE_PATH ?? '/meeting-vision-studio/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});
