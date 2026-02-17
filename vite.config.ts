import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages project site: https://xiongemi.github.io/dnd-poc/
  base: process.env.VITE_BASE ?? '/',
});
