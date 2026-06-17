<script setup lang="ts">
withDefaults(defineProps<{
	variant?: 'primary' | 'ghost' | 'quiet'
	as?: 'button' | 'a'
}>(), { variant: 'primary', as: 'button' })
</script>

<template>
	<component :is="as" class="ak-btn" :data-variant="variant">
		<slot />
	</component>
</template>
