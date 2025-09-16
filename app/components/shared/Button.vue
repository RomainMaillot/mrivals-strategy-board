<template>
  <GeneralLink
    v-if="url || title || icon"
    @click.native="emit('click', $event)"
    :class="classes"
    :disable="disable"
    v-bind="props"
  >
    <CText
      v-if="title"
      type="body-m"
      class="Button__inner"
      :fluidHeight="fluidHeight"
      >{{ title ?? label }}</CText
    >
    <slot />
  </GeneralLink>
</template>

<script setup>
const props = defineProps({
  title: String,
  url: String,
  target: String,

  icon: {
    type: String,
    default: null,
  },

  type: {
    type: String,
    default: "primary",
  },

  size: {
    type: String,
    default: "default",
  },

  disable: {
    type: Boolean,
    default: false,
  },

  fluidHeight: {
    type: Boolean,
    default: false,
  },
});

/**
 * Emits
 */
const emit = defineEmits(["click"]);

/**
 * Computed
 */

const classes = computed(() => {
  return [
    "Button",
    `Button--${props.type}`,
    `Button--${props.size}`,
    {
      "Button--fluid-height": props.fluidHeight,
      "Button--icon": props.icon,
      "Button--disable": props.disable,
    },
  ];
});
</script>

<style lang="scss">
@use "~/assets/scss/utils/tools" as *;

.Button {
  display: inline-flex;
  align-items: center;
  gap: base8(4);
  border-radius: rem(50);
  background-color: var(--blanc);
  color: var(--noir);
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;

  // size classes
  &--default {
    padding: rem(30) rem(42);
    .Button__inner {
      @include body-m-style;
    }
  }

  &--small {
    padding: rem(20) rem(20) rem(18) rem(20);
    .Button__inner {
      @include body-xs-style;
    }
  }

  &--fluid-height {
    @media screen and (max-height: $desktop-min-height) {
      padding: 4vh 5vh;
    }
  }

  // type classes

  &--secondary {
    background-color: var(--noir);
    color: var(--blanc);
  }

  &--tertiary {
    background-color: transparent;
    border: 1px solid var(--noir);
  }

  // state classes

  &--disable {
    pointer-events: none;
    opacity: 0.5;
  }

  // states
  &:hover {
    transform: rotate(2deg);
  }
}
</style>
