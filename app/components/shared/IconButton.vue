<template>
	<Button class="IconButton" @click="emit('click', $event)" :icon="icon" :title="title" :url="url" :target="target" :type="type">
		<slot />
		<Icon class="IconButton__icon" :name="icon" />
	</Button>
</template>

<script setup>
const emit = defineEmits(['click']);

const props = defineProps({
	title: String,
	url: String,
	target: String,
	type: String,
	icon: String,
});
</script>

<style lang="scss"></style>
