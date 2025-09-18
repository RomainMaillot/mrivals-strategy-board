<!-- Documentation : https://app.clickup.com/10601487/v/dc/a3h0f-100767/a3h0f-18007 -->

<template>
  <picture v-if="third">
    <source type="image/webp" :srcset="data.genericMobile" />
    <source :srcset="data.genericMobile" />
    <img
      :class="classes"
      @load="onLoad"
      @error="onError"
      loading="lazy"
      v-if="parallax"
      :width="data.mediaDetails.width"
      :height="data.mediaDetails.height"
      :src="data.genericMobile"
      :alt="alt ? alt : ''"
      v-parallax
    />
    <img
      :class="classes"
      @load="onLoad"
      @error="onError"
      loading="lazy"
      v-else
      :width="data.mediaDetails.width"
      :height="data.mediaDetails.height"
      :src="data.genericMobile"
      :alt="alt ? alt : ''"
    />
  </picture>
  <picture v-else-if="half">
    <source
      type="image/webp"
      media="(max-width: 1440px)"
      :srcset="data.genericMobile"
    />
    <source
      type="image/webp"
      media="(min-width: 1441px)"
      :srcset="data.genericTablet"
    />
    <source media="(max-width: 1440px)" :srcset="data.genericMobile" />
    <source media="(min-width: 1441px)" :srcset="data.genericTablet" />
    <img
      loading="lazy"
      v-if="parallax"
      :width="data.mediaDetails.width"
      :height="data.mediaDetails.height"
      :src="data.genericTablet"
      :alt="alt ? alt : ''"
      v-parallax
    />
    <img
      :class="classes"
      @load="onLoad"
      @error="onError"
      loading="lazy"
      v-else
      :width="data.mediaDetails.width"
      :height="data.mediaDetails.height"
      :src="data.genericTablet"
      :alt="alt ? alt : ''"
    />
  </picture>
  <picture v-else>
    <source
      type="image/webp"
      media="(max-width: 768px)"
      :srcset="data.genericMobile"
    />
    <source
      type="image/webp"
      media="(min-width: 769px) and (max-width: 1024px)"
      :srcset="data.genericTablet"
    />
    <source
      type="image/webp"
      media="(min-width: 1025px) and (max-width: 1440px)"
      :srcset="data.genericDesktop"
    />
    <source
      type="image/webp"
      media="(min-width: 1441px)"
      :srcset="data.generic"
    />
    <source media="(max-width: 768px)" :srcset="data.genericMobile" />
    <source
      media="(min-width: 769px) and (max-width: 1024px)"
      :srcset="data.genericTablet"
    />
    <source
      media="(min-width: 1025px) and (max-width: 1440px)"
      :srcset="data.genericDesktop"
    />
    <source media="(min-width: 1441px)" :srcset="data.generic" />
    <img
      :class="classes"
      @load="onLoad"
      @error="onError"
      loading="lazy"
      :width="data.width"
      :height="data.height"
      :src="data.generic"
      :alt="alt ? alt : ''"
    />
  </picture>
</template>

<script setup>
const props = defineProps({
  data: [Object, String],
  alt: String,
  half: Boolean,
  third: Boolean,
  parallax: Boolean,
});

/**
 * Reactives
 */
const error = ref(false);
const loaded = ref(false);
/**
 * Computeds
 */
const classes = computed(() => {
  return [
    "Picture",
    {
      "Picture--loaded": loaded.value,
      "Picture--error": error.value,
    },
  ];
});
/**
 * Methods
 */

const onLoad = () => {
  loaded.value = true;
};
const onError = (_e) => {
  error.value = true;
};
</script>

<style lang="scss">
.Picture {
  display: block;
  height: auto;
  width: 100%;
  opacity: 0;

  &--loaded {
    transition: 0.3s ease-out;
    opacity: 1;
  }

  &--error {
    position: relative;
    border-radius: base8(2);

    &::before {
      content: "";
      @include absoluteBox();
      background-color: var(--rouge);
    }

    &::after {
      content: "Error loading the image";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--blanc);
      text-align: center;
    }
  }
}
</style>
