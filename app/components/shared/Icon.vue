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

// resolve icons
icons.set("fire", resolveComponent("IconFlame"));
icons.set("close", resolveComponent("Close"));
icons.set("lightning", resolveComponent("IconFlash"));
icons.set("downArrow", resolveComponent("IconDownArrow"));
icons.set("cross", resolveComponent("IconCross"));
icons.set("rightArrow", resolveComponent("IconRightArrow"));
icons.set("sound", resolveComponent("Sound"));

// Strategy Board icons
icons.set("cursor", resolveComponent("IconCursor"));
icons.set("pencil", resolveComponent("IconPencil"));
icons.set("eraser", resolveComponent("IconEraser"));
icons.set("trash", resolveComponent("IconTrash"));
icons.set("save", resolveComponent("IconSave"));
icons.set("download", resolveComponent("IconDownload"));

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
