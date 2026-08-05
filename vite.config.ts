import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 部署到 GitHub Pages 时使用仓库名作为 base 路径
const isGHPages = process.env.GH_PAGES === 'true'

export default defineConfig({
  plugins: [react()],
  base: isGHPages ? '/Fuelog/' : '/',
  server: {
    port: 5173,
  },
})
