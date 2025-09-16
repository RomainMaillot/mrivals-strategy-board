<!-- Documentation : https://app.clickup.com/10601487/v/dc/a3h0f-100767/a3h0f-19302 -->

<template>
	<a v-if="url && isExternalLink(url)" :href="url" target="_blank" rel="noopener">
		<slot></slot>
		<template v-if="!$slots.default">
			{{ title }}
		</template>
	</a>
	<a v-else-if="url && isAnchorLink(url)" :href="url" class="anchor-link" @click.prevent="goToAnchor">
		<slot></slot>
		<template v-if="!$slots.default">
			{{ title }}
		</template>
	</a>
	<NuxtLink v-else-if="url" :to="getPath(url)">
		<slot></slot>
		<template v-if="!$slots.default">
			{{ title }}
		</template>
	</NuxtLink>
	<button v-else :disabled="disable">
		<slot></slot>
		<template v-if="!$slots.default">
			{{ title }}
		</template>
	</button>
</template>

<script setup>
import { useRuntimeConfig } from '#imports';
const config = useRuntimeConfig();
const { scrollTo } = useScroll();
const { siteDomain } = config.public;

// Props
const props = defineProps({
	url: String,
	title: String,
	target: String,
	disable: Boolean,
});

// Methods
const isExternalLink = (url) => {
	if (url.type && url.type === 'url') {
		return true;
	} else if (url.startsWith('mailto:')) {
		// mailto
		return true;
	} else if (url.startsWith('tel:')) {
		// tel:
		return true;
	} else if (url.includes('/uploads')) {
		return true;
	} else if (/^https?:\/\//.test(url)) {
		// Absolute URL.
		return !url.includes(siteDomain);
	} else {
		// Relative URL.
		return false;
	}
};

const isAnchorLink = (url) => {
	const res = url.match(/^#([a-z0-9-_/]+)$/i);
	if (res?.[1]) return true;
	else return false;
};

const goToAnchor = () => {
	scrollTo({ to: url, duration: 0.9 });
};

const getPath = (url) => {
	const hash = url.includes('#') ? `#${url.slice(url.lastIndexOf('#') + 1)}` : null; //get hash
	try {
		if (url.match(/\?./)) {
			let urlObject = new URL(url);
			var object = { path: urlObject.pathname, query: {}, hash: hash };
			urlObject.searchParams.forEach(function (value, key) {
				object.query[key] = value;
			});
			return object;
		} else if (url.match(/^\/[a-z0-9-/]+$/i)) {
			return { path: url, hash: hash };
		} else {
			return { path: new URL(url).pathname, hash: hash };
		}
	} catch (error) {
		//console.log(error);
		return '/';
	}
};
</script>
