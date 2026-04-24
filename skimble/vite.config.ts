import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
   build: {
    rollupOptions: {
      input: {
        main: "src/script.ts",
        popup: "index.html"
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "script") return "script.js";
          return "[name].js";
        }
      }
    }
  },
  plugins: [
    tailwindcss(),
  ],
})