import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    watch: {
      // 監控 public 目錄下的所有 .html 檔案
      //include: 'public/**/*.html',
      // 監控專案根目錄下包括子資料夾下的所有 .html 檔案
      include: '**/*.html',
    },
  },
})
