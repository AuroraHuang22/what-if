// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['@/assets/css/tailwind.css'],
  modules: ['@nuxt/ui'],

  generate: {
    routes: ['/', '/404'],
  },

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: [
        '/', '/404',
      ],
    },
  },

  compatibilityDate: '2025-01-06'
});