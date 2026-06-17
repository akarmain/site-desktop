<script setup lang="ts">
withDefaults(defineProps<{ label: string; as?: 'button' | 'a' }>(), { as: 'button' })
</script>

<template>
	<component :is="as" class="ak-desktop-icon">
		<span class="ak-desktop-icon__box">
			<slot />
		</span>
		<span>{{ label }}</span>
	</component>
</template>
