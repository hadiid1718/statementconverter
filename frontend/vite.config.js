import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
// This configuration sets up Vite for a React project, enabling React support and configuring the development server.
// It also includes an alias for easier imports from the src directory.