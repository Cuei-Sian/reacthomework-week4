import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/reacthomework-week4/',
  plugins: [react()],
  server: {
    open: true, // 加這一行，run dev才會自動開網頁
  },
});
