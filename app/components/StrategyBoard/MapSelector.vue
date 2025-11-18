<template>
  <div class="map-selector">
    <div class="map-selector__header">
      <h3 class="map-selector__title">Maps</h3>
      <button class="map-selector__clear" type="button" @click="clearMap">
        Clear map
      </button>
    </div>

    <div v-if="pending" class="map-selector__loading">Loading maps...</div>

    <div v-else class="map-tree">
      <div v-for="mode in modes" :key="mode.modeKey" class="map-mode">
        <button
          type="button"
          class="map-mode__button"
          :class="{
            'map-mode__button--expanded': expandedMode === mode.modeKey,
          }"
          @click="toggleMode(mode.modeKey)"
        >
          <span>{{ mode.label }}</span>
          <span class="map-mode__chevron">
            {{ expandedMode === mode.modeKey ? "▾" : "▸" }}
          </span>
        </button>

        <div v-if="expandedMode === mode.modeKey" class="map-mode__content">
          <div v-for="map in mode.maps" :key="map.mapKey" class="map-entry">
            <button
              type="button"
              class="map-entry__button"
              :class="{
                'map-entry__button--expanded': expandedMap === map.mapKey,
              }"
              @click="toggleMap(map.mapKey)"
            >
              <span>{{ formatLabel(map.mapKey) }}</span>
              <span class="map-entry__chevron">
                {{ expandedMap === map.mapKey ? "▾" : "▸" }}
              </span>
            </button>

            <div v-if="expandedMap === map.mapKey" class="map-entry__content">
              <div
                v-for="point in map.points"
                :key="point.pointKey"
                class="map-point"
              >
                <button
                  type="button"
                  class="map-point__button"
                  :class="{
                    'map-point__button--expanded':
                      expandedPoint === point.pointKey,
                  }"
                  @click="togglePoint(point.pointKey)"
                >
                  <span>{{ formatLabel(point.pointKey) }}</span>
                  <span class="map-point__chevron">
                    {{ expandedPoint === point.pointKey ? "▾" : "▸" }}
                  </span>
                </button>

                <div
                  v-if="expandedPoint === point.pointKey"
                  class="map-point__content"
                >
                  <button
                    v-for="image in point.images"
                    :key="image.url"
                    type="button"
                    class="map-image-row"
                    :class="{
                      'map-image-row--selected':
                        selectedBackground === image.url,
                    }"
                    @click="selectImage(image.url)"
                  >
                    <span class="map-image-row__name">
                      {{ formatLabel(image.fileName) }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
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
 * Types for client-side structures (aligned with /api/maps).
 */
/**
 * @typedef {Object} MapImage
 * @property {string} fileName - File name, e.g. 1st-phase.png
 * @property {string} url - Public URL path for the image
 */

/**
 * @typedef {Object} MapPoint
 * @property {string} pointKey - Directory name for the point
 * @property {MapImage[]} images - Images contained in this point
 */

/**
 * @typedef {Object} MapEntry
 * @property {string} mapKey - Directory name for the map
 * @property {MapPoint[]} points - Points contained in this map
 */

/**
 * @typedef {Object} MapMode
 * @property {string} modeKey - Mode key (convoy, domination)
 * @property {string} label - Human readable label
 * @property {MapEntry[]} maps - Maps available for this mode
 */

/**
 * Fetch map structure from backend API.
 */
const { data, pending } = useFetch("/maps/maps.json");

/**
 * Derived list of modes (fallback to empty array if data is not ready).
 */
const modes = computed(() => {
  if (!data.value || !data.value.modes) {
    return [];
  }
  return data.value.modes;
});

/**
 * Local state for expanded sections.
 */
const expandedMode = ref(null);
const expandedMap = ref(null);
const expandedPoint = ref(null);

/**
 * Track currently selected background for styling.
 */
const selectedBackground = ref(props.selectedMap);

/**
 * Format raw folder/file keys into human readable labels.
 * - Removes a trailing .png extension.
 * - Replaces '-' and '_' with spaces.
 * - Capitalizes each word (ordinals like 1st, 2nd are kept as-is).
 */
const formatLabel = (rawValue) => {
  if (!rawValue) {
    return "";
  }

  const withoutExtension = rawValue.replace(/\.png$/i, "");
  const withSpaces = withoutExtension.replace(/[-_]+/g, " ");
  const parts = withSpaces.split(" ").filter((part) => part.length > 0);

  const formattedParts = parts.map((part) => {
    const lower = part.toLowerCase();

    // Keep ordinal tokens (1st, 2nd, 3rd, 4th, etc.) as-is
    if (/^\d+(st|nd|rd|th)$/i.test(lower)) {
      return lower;
    }

    return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
  });

  return formattedParts.join(" ");
};

/**
 * Toggle helpers for each level of the tree.
 */
const toggleMode = (modeKey) => {
  expandedMode.value = expandedMode.value === modeKey ? null : modeKey;
  // Reset lower levels when switching mode
  expandedMap.value = null;
  expandedPoint.value = null;
};

const toggleMap = (mapKey) => {
  expandedMap.value = expandedMap.value === mapKey ? null : mapKey;
  // Reset points when switching map
  expandedPoint.value = null;
};

const togglePoint = (pointKey) => {
  expandedPoint.value = expandedPoint.value === pointKey ? null : pointKey;
};

/**
 * Select a concrete image to use as canvas background.
 */
const selectImage = (url) => {
  selectedBackground.value = url;
  emit("map-selected", url);
};

/**
 * Clear map and use blank canvas.
 */
const clearMap = () => {
  selectedBackground.value = null;
  emit("map-selected", null);
};

/**
 * Keep local selection in sync with external prop.
 */
watch(
  () => props.selectedMap,
  (newMap) => {
    selectedBackground.value = newMap;
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
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: rem(8);
  }

  &__clear {
    border: none;
    background: transparent;
    color: var(--gris, #6b7280);
    font-size: rem(12);
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
  }

  &__loading {
    font-size: rem(14);
    color: var(--gris, #6b7280);
  }
}

.map-tree {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: rem(8);
}

.map-mode {
  width: 100%;

  &__button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: rem(10) rem(12);
    border-radius: rem(6);
    border: 1px solid var(--gris, #e5e7eb);
    background: var(--blanc, #fff);
    cursor: pointer;
    font-size: rem(14);
    font-weight: 600;
    color: var(--noir, #111827);
    transition: background 0.15s ease, border-color 0.15s ease;

    &--expanded {
      background: var(--indigo, #eff6ff);
      border-color: var(--indigo, #3b82f6);
    }
  }

  &__chevron {
    font-size: rem(12);
    color: var(--gris, #6b7280);
  }

  &__content {
    margin-top: rem(4);
    padding-left: rem(8);
    border-left: 1px solid var(--gris, #e5e7eb);
    display: flex;
    flex-direction: column;
    gap: rem(4);
  }
}

.map-entry {
  &__button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: rem(8) rem(10);
    border-radius: rem(6);
    border: 1px solid var(--gris, #e5e7eb);
    background: var(--blanc, #fff);
    cursor: pointer;
    font-size: rem(13);
    color: var(--noir, #111827);
    transition: background 0.15s ease, border-color 0.15s ease;

    &--expanded {
      background: var(--blanc, #f3f4ff);
      border-color: var(--indigo, #3b82f6);
    }
  }

  &__chevron {
    font-size: rem(12);
    color: var(--gris, #6b7280);
  }

  &__content {
    margin-top: rem(4);
    padding-left: rem(8);
    border-left: 1px dashed var(--gris, #e5e7eb);
    display: flex;
    flex-direction: column;
    gap: rem(4);
  }
}

.map-point {
  &__button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: rem(6) rem(10);
    border-radius: rem(6);
    border: 1px solid var(--gris, #e5e7eb);
    background: var(--blanc, #fff);
    cursor: pointer;
    font-size: rem(12);
    color: var(--noir, #111827);
    transition: background 0.15s ease, border-color 0.15s ease;

    &--expanded {
      background: var(--blanc, #f9fafb);
      border-color: var(--indigo, #3b82f6);
    }
  }

  &__chevron {
    font-size: rem(11);
    color: var(--gris, #6b7280);
  }

  &__content {
    margin-top: rem(4);
    padding-left: rem(8);
    border-left: 1px dotted var(--gris, #e5e7eb);
    display: flex;
    flex-direction: column;
    gap: rem(2);
  }
}

.map-image-row {
  width: 100%;
  text-align: left;
  padding: rem(4) rem(8);
  border-radius: rem(4);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font-size: rem(11);
  color: var(--noir, #111827);
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--blanc, #eff6ff);
    border-color: var(--indigo, #bfdbfe);
  }

  &--selected {
    background: var(--indigo, #eff6ff);
    border-color: var(--indigo, #3b82f6);
  }

  &__name {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.map-none {
  margin-top: rem(8);
  width: 100%;
  padding: rem(8) rem(10);
  border-radius: rem(6);
  border: 1px solid var(--gris, #e5e7eb);
  background: var(--blanc, #fff);
  cursor: pointer;
  font-size: rem(12);
  color: var(--gris, #4b5563);
  text-align: center;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--blanc, #f9fafb);
  }

  &--selected {
    background: var(--gris, #f3f4f6);
    border-color: var(--gris, #9ca3af);
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
