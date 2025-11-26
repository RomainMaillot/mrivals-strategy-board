<template>
  <div class="color-selector">
    <div
      v-for="(category, categoryName) in colorPalette"
      :key="categoryName"
      class="color-category"
    >
      <div class="color-category__swatches">
        <button
          v-for="color in category"
          :key="color"
          type="button"
          class="color-swatch"
          :class="{ 'color-swatch--selected': modelValue === color }"
          :style="{ backgroundColor: color }"
          :title="color"
          @click="selectColor(color)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Props
 */
const props = defineProps({
  modelValue: {
    type: String,
    default: "#000000",
  },
});

/**
 * Emits
 */
const emit = defineEmits(["update:modelValue"]);

/**
 * Predefined color palette organized by category
 * Each category has 5 shades that work well together
 */
const colorPalette = {
  black: [
    "#333333", // Dark gray
  ],
  white: [
    "#e8e8e8", // Light gray
  ],
  red: [
    "#f87171", // Red 400
  ],
  green: [
    "#4ade80", // Green 400
  ],
  blue: [
    "#60a5fa", // Blue 400
  ],
  cyan: [
    "#22d3ee", // Cyan 400
  ],
  magenta: [
    "#e879f9", // Fuchsia 400
  ],
  yellow: [
    "#facc15", // Yellow 400
  ],
};

/**
 * Methods
 */
const selectColor = (color) => {
  emit("update:modelValue", color);
};
</script>

<style lang="scss" scoped>
.color-selector {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: rem(12);
}

.color-category {
  display: flex;
  flex-direction: column;
  gap: rem(6);

  &__swatches {
    display: flex;
    gap: rem(6);
    flex-wrap: wrap;
  }
}

.color-swatch {
  width: rem(28);
  height: rem(28);
  border-radius: 50%;
  border: 2px solid #000000;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: relative;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &--selected {
    border-width: 3px;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
    transform: scale(1.15);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
}
</style>
