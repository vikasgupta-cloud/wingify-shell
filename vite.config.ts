import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Bind all interfaces (incl. IPv4 0.0.0.0) so http://127.0.0.1:<port> works —
  // the default localhost bind resolved to IPv6 [::1] only on this machine, which
  // browsers resolving localhost→127.0.0.1 couldn't reach.
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
