<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		:width="isDown ? 2 : 459"
		:height="isDown ? 172 : 3"
		:viewBox="isDown ? '0 0 2 172' : '0 0 459 3'"
		preserveAspectRatio="none"
		fill="none">
		<path v-if="isDown" d="M1 0.279297L1.00001 171.279" stroke="black" stroke-dasharray="5 5" />
		<path v-else d="M459 1.2793L2.6417e-06 1.2793" stroke="black" stroke-dasharray="5 5" />
	</svg>
</template>

<script setup>
// Props
const props = defineProps({
	isDown: {
		type: Boolean,
		default: false,
	},
});
</script>
