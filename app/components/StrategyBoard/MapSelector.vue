<template>
  <div class="map-selector">
    <h3 class="map-selector__title">Map Selection</h3>

    <div class="map-grid">
      <div
        v-for="map in availableMaps"
        :key="map.id"
        class="map-card"
        :class="{ 'map-card--selected': selectedMapId === map.id }"
        @click="selectMap(map)"
      >
        <div class="map-preview">
          <img
            v-if="map.preview"
            :src="map.preview"
            :alt="map.name"
            class="map-image"
          />
          <div v-else class="map-placeholder">
            {{ map.name.charAt(0) }}
          </div>
        </div>

        <div class="map-info">
          <h4 class="map-name">{{ map.name }}</h4>
          <span class="map-mode">{{ map.mode }}</span>
        </div>
      </div>

      <!-- No Map Option -->
      <div
        class="map-card"
        :class="{ 'map-card--selected': selectedMapId === null }"
        @click="selectMap(null)"
      >
        <div class="map-preview">
          <div class="map-placeholder no-map">✕</div>
        </div>

        <div class="map-info">
          <h4 class="map-name">No Map</h4>
          <span class="map-mode">Blank Canvas</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Props
 */
const props = defineProps({
  selectedMap: {
    type: String,
    default: null,
  },
});

/**
 * Emits
 */
const emit = defineEmits(["map-selected"]);

/**
 * Marvel Rivals Maps Data
 */
const availableMaps = [
  {
    id: "institute_of_science",
    name: "Institute of science",
    mode: "Convoy",
    background: "/maps/institut_of_science.png",
    preview: "/maps/institut_of_science.png",
  },
  {
    id: "warrior_falls",
    name: "Warrior Falls",
    mode: "Convergence",
    background: "/maps/warrior_falls.png",
    preview: "/maps/warrior_falls.png",
  },
  {
    id: "krakoa",
    name: "Krakoa",
    mode: "Domination",
    background: "/maps/krakoa.png",
    preview: "/maps/krakoa.png",
  },
  {
    id: "hells_heaven",
    name: "Hell's Heaven",
    mode: "Domination",
    background: "/maps/hell_heaven.png",
    preview: "/maps/hell_heaven.png",
  },
];

/**
 * Reactive data
 */
const selectedMapId = ref(
  availableMaps.find((map) => map.background === props.selectedMap)?.id || null
);

/**
 * Methods
 */
const selectMap = (map) => {
  selectedMapId.value = map?.id || null;
  emit("map-selected", map?.background || null);
};

/**
 * Watch for prop changes
 */
watch(
  () => props.selectedMap,
  (newMap) => {
    selectedMapId.value =
      availableMaps.find((map) => map.background === props.selectedMap)?.id ||
      null;
  }
);
</script>

<style lang="scss" scoped>
.map-selector {
  display: flex;
  flex-direction: column;
  gap: rem(16);
  padding: rem(20);
  background: var(--blanc, #fff);
  border: 1px solid var(--gris, #e5e7eb);
  border-radius: 0 0 rem(12) rem(12);
  width: rem(320);
  max-height: rem(600);
  overflow-y: auto;

  &__title {
    font-size: rem(16);
    font-weight: 600;
    color: var(--noir, #1f2937);
    margin: 0;
  }
}

.map-grid {
  display: flex;
  flex-direction: column;
  gap: rem(8);
}

.map-card {
  display: flex;
  align-items: center;
  gap: rem(12);
  padding: rem(12);
  border: 1px solid var(--gris, #e5e7eb);
  border-radius: rem(8);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--blanc, #fff);

  &:hover {
    border-color: var(--indigo, #3b82f6);
    background: var(--blanc, #f8fafc);
    transform: translateY(-1px);
  }

  &--selected {
    border-color: var(--indigo, #3b82f6);
    background: var(--indigo, #eff6ff);

    /* .map-name {
      color: var(--indigo, #3b82f6);
    } */
  }
}

.map-preview {
  width: rem(60);
  height: rem(40);
  border-radius: rem(4);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--gris, #f3f4f6);
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: rem(18);
  color: var(--blanc, #fff);
  background: linear-gradient(135deg, #4f46e5, #7c3aed);

  &.no-map {
    background: var(--gris, #9ca3af);
    font-size: rem(16);
  }
}

.map-info {
  display: flex;
  flex-direction: column;
  gap: rem(2);
  flex: 1;
}

.map-name {
  font-size: rem(14);
  font-weight: 600;
  color: var(--noir, #1f2937);
  margin: 0;
}

.map-mode {
  font-size: rem(12);
  color: var(--gris, #6b7280);
  text-transform: uppercase;
  font-weight: 500;
}
</style>
