import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { default as eslint } from 'vite-plugin-eslint';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), eslint()],
  server: {
    port: 3000,
  },
})
