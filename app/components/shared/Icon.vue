<template>
  <component
    v-if="component"
    class="Icon"
    :class="`Icon--${size}`"
    :is="component"
  ></component>
</template>

<script setup>
/**
 * Declarations
 */
const icons = new Map();

// resolve icons
icons.set("fire", resolveComponent("IconFlame"));
icons.set("close", resolveComponent("Close"));
icons.set("lightning", resolveComponent("IconFlash"));
icons.set("downArrow", resolveComponent("IconDownArrow"));
icons.set("cross", resolveComponent("IconCross"));
icons.set("rightArrow", resolveComponent("IconRightArrow"));
icons.set("sound", resolveComponent("Sound"));

/**
 * Props
 */

const props = defineProps({
  name: { type: String, default: "downArrow" },
  size: { type: String, default: "medium" },
});

/**
 * Computeds
 */

const component = computed(() => {
  if (!icons.has(props.name)) {
    console.warn("Icon not found with name : ", props.name);
    return "div";
  } else return icons.get(props.name);
});
</script>

<style lang="scss">
@use "~/assets/scss/utils/tools" as *;

.Icon {
  pointer-events: none;

  &--large {
    width: rem(48);
    height: rem(48);
  }

  &--medium {
    width: rem(32);
    height: rem(32);
  }

  &--small {
    width: rem(18);
    height: rem(18);
  }

  &--tiny {
    width: rem(12);
    height: rem(12);
  }
}
</style>
