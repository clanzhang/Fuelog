import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署：仓库名为 Fuelog，静态资源需带上前缀
  base: '/Fuelog/',
  server: {
    port: 5173,
  },
})

