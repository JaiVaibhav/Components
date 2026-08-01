import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    host: '0.0.0.0',
    port: 4173, // local default; Render will override via $PORT if you pass it
    allowedHosts: ['componentstomasterreact.onrender.com'],
  },
});
