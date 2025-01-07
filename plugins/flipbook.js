import FlipbookVue from 'flipbook-vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FlipbookVue', FlipbookVue);
});