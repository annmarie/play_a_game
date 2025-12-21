import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { default as eslint } from 'vite-plugin-eslint';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), eslint()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
})
