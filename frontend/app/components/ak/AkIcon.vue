<script setup lang="ts">
import { icons } from '~/data/icons'

// ponytail: svg-файлы добавляются сюда по мере миграции из icons.ts
const svgComponents: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  gitlab: defineAsyncComponent(() => import('~/assets/icons/gitlab.svg')),
  mail: defineAsyncComponent(() => import('~/assets/icons/mail.svg')),
}

const props = defineProps<{ name: string }>()
const comp = svgComponents[props.name]
const markup = !comp ? (icons[props.name] ?? '') : ''
</script>

<template>
  <span class="ak-ico">
    <component v-if="comp" :is="comp" />
    <span v-else v-html="markup" />
  </span>
</template>
