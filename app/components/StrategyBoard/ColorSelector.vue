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
    "#000000", // Pure black
    "#1a1a1a", // Very dark gray
    "#333333", // Dark gray
    "#4a4a4a", // Medium dark gray
    "#666666", // Medium gray
  ],
  white: [
    "#ffffff", // Pure white
    "#f5f5f5", // Off white
    "#e8e8e8", // Light gray
    "#d3d3d3", // Medium light gray
    "#c0c0c0", // Silver
  ],
  red: [
    "#dc2626", // Red 600
    "#ef4444", // Red 500
    "#f87171", // Red 400
    "#fca5a5", // Red 300
    "#fecaca", // Red 200
  ],
  green: [
    "#16a34a", // Green 600
    "#22c55e", // Green 500
    "#4ade80", // Green 400
    "#86efac", // Green 300
    "#bbf7d0", // Green 200
  ],
  blue: [
    "#2563eb", // Blue 600
    "#3b82f6", // Blue 500
    "#60a5fa", // Blue 400
    "#93c5fd", // Blue 300
    "#dbeafe", // Blue 200
  ],
  cyan: [
    "#0891b2", // Cyan 600
    "#06b6d4", // Cyan 500
    "#22d3ee", // Cyan 400
    "#67e8f9", // Cyan 300
    "#cffafe", // Cyan 200
  ],
  magenta: [
    "#c026d3", // Fuchsia 600
    "#d946ef", // Fuchsia 500
    "#e879f9", // Fuchsia 400
    "#f0abfc", // Fuchsia 300
    "#f9a8d4", // Pink 300
  ],
  yellow: [
    "#ca8a04", // Yellow 600
    "#eab308", // Yellow 500
    "#facc15", // Yellow 400
    "#fde047", // Yellow 300
    "#fef08a", // Yellow 200
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
  flex-direction: column;
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
