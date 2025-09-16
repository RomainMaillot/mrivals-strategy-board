<template>
  <component v-if="!html" ref="el" :is="tag" :class="classes"
    ><slot></slot
  ></component>
  <div v-else ref="el" :class="classes" v-html="html"></div>
</template>

<script setup>
/**
 * PROPS
 */
const props = defineProps({
  tag: {
    type: String,
    default: "span",
    required: false,
  },
  type: {
    type: String,
    default: "",
    required: false,
  },
  html: {
    type: String,
    default: "",
    required: false,
  },
  uppercase: {
    type: Boolean,
    default: false,
    required: false,
  },
  fluid: {
    type: Boolean,
    default: true,
    required: false,
  },
  fluidHeight: {
    type: Boolean,
    default: false,
    required: false,
  },
  bold: {
    type: Boolean,
    default: false,
    required: false,
  },
  serif: {
    type: Boolean,
    default: false,
    required: false,
  },
  italic: {
    type: Boolean,
    default: false,
    required: false,
  },
  center: {
    type: Boolean,
    default: false,
    required: false,
  },
});

const el = ref(null);
defineExpose({ el });

/**
 * COMPUTED
 */
const classes = computed(() => {
  return [
    "CText",
    props.type,
    props.fluid ? `${props.type}--fluid` : "",
    {
      "CText--uppercase": props.uppercase,
      "CText--bold": props.bold,
      "CText--serif": props.serif,
      "CText--italic": props.italic,
      "CText--fluid-height": props.fluidHeight,
      "CText--center": props.center,
    },
  ];
});
</script>

<style lang="scss">
@use "~/assets/scss/utils/media-queries" as *;

.CText {
  &--uppercase {
    text-transform: uppercase;
  }

  &--serif {
    font-family: "Signifier";
    font-weight: 300;
  }

  &--bold {
    font-weight: 500;
  }

  &--italic {
    font-style: italic;
  }

  &--center {
    text-align: center;
  }

  &--fluid-height {
    @media screen and (max-height: $desktop-min-height) {
      font-size: calc(
        var(--font-size) / var(--desktop-min-height) * 100vh
      ); // ratio height;
    }
  }
}
</style>
