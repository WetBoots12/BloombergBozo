import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    viteSingleFile(),
  ],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
  },
})
