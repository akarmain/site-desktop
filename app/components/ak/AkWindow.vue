<script setup lang="ts">
defineProps<{ title: string; focused?: boolean }>()
</script>

<template>
	<section class="ak-window ak-notch" :data-focus="focused ? 'true' : 'false'">
		<div class="ak-window__head">
			<span>{{ title }}</span>
			<span class="ak-dither flex-1 self-stretch opacity-30" />
			<slot name="actions" />
		</div>
		<div class="ak-window__body">
			<slot />
		</div>
	</section>
</template>
