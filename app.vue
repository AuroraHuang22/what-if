<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
import { useHead } from 'nuxt/app';

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap',
    },
  ],
});
</script>

<style scoped>
html,
body {
  height: 100%;
  width: 100%;
  overflow: hidden; /* 禁止垂直滾動 */
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
}
</style>
