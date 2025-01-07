export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['@/assets/css/tailwind.css'],
  modules: ['@nuxt/ui'],

  app: {
    baseURL: '/what-if/', // 設置 baseURL 為子目錄路徑
  },

  generate: {
    routes: ['/', '/404'], // 指定要生成的靜態路由
  },

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/', '/404'], // 明確指定要預渲染的路由
    },
  },
  plugins: [
    { src: "~/components/BackgroundAnimation.vue", mode: "client" },
    '~/plugins/flipbook.js'
  ],
  compatibilityDate: '2025-01-06',
});