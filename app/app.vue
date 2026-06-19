<script setup lang="ts">
// SEO i18n: <html lang>, dir и hreflang-ссылки для «/» (ru) и «/en».
useHead(useLocaleHead())
</script>

<template>
  <!-- Оболочка живёт в pages/index.vue, чтобы i18n создавал роуты «/» (ru) и «/en». -->
  <NuxtPage />
</template>
