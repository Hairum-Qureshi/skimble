import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        // Ensure index.html is treated as the popup entry
        popup: resolve(__dirname, 'index.html'),
        // Your content script
        script: resolve(__dirname, 'src/script.ts'),
      },
      output: {
        // This ensures your content script is named EXACTLY script.js
        // and placed at the root of the /dist folder
        entryFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
    // Optional: clears the dist folder before every build to prevent old file clutter
    emptyOutDir: true,
  },
})