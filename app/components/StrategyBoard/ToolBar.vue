<template>
  <div
    class="toolbar"
    :class="{
      'toolbar--open': isOpen,
      '--toggle-height': toggleHeight,
    }"
  >
    <div class="toolbar__toggle" @click="isOpen = !isOpen">
      <CText type="h3" class="toolbar__title">Tools</CText>
      <div
        class="toolbar__toggle-icon"
        :class="{ 'toolbar__toggle-icon--open': isOpen }"
      >
        <Icon name="downArrow" size="small" />
      </div>
    </div>
    <div class="toolbar__section">
      <div class="toolbar__buttons">
        <Button
          :type="currentTool === 'select' ? 'secondary' : 'tertiary'"
          size="small"
          @click="setTool('select')"
          title="Select"
        >
          <Icon name="cursor" size="small" />
        </Button>

        <Button
          :type="currentTool === 'draw' ? 'secondary' : 'tertiary'"
          size="small"
          @click="setTool('draw')"
          title="Drawing"
        >
          <Icon name="pencil" size="small" />
        </Button>

        <Button
          :type="currentTool === 'text' ? 'secondary' : 'tertiary'"
          size="small"
          @click="setTool('text')"
          title="Text"
        >
          <Icon name="text" size="small" />
        </Button>

        <Button
          :type="currentTool === 'erase' ? 'secondary' : 'tertiary'"
          size="small"
          @click="setTool('erase')"
          title="Eraser"
        >
          <Icon name="eraser" size="small" />
        </Button>
      </div>
    </div>

    <div
      class="toolbar__section"
      v-if="currentTool === 'draw' || currentTool === 'erase'"
    >
      <h3 class="toolbar__title">Drawing</h3>
      <div class="toolbar__controls">
        <div class="control-group">
          <label class="control-label">Brush Size</label>
          <input
            type="range"
            v-model="brushSize"
            min="1"
            max="20"
            class="range-input"
          />
          <span class="control-value">{{ brushSize }}px</span>
        </div>

        <div class="control-group">
          <label class="control-label">Color</label>
          <ColorSelector v-model="brushColor" />
        </div>
      </div>
    </div>

    <div class="toolbar__section" v-if="currentTool === 'text'">
      <h3 class="toolbar__title">Text</h3>
      <div class="toolbar__controls">
        <div class="control-group">
          <label class="control-label">Font Size</label>
          <input
            type="range"
            v-model="fontSize"
            min="8"
            max="72"
            class="range-input"
          />
          <span class="control-value">{{ fontSize }}px</span>
        </div>

        <div class="control-group">
          <label class="control-label">Color</label>
          <ColorSelector v-model="textColor" />
        </div>
      </div>
    </div>

    <div class="toolbar__section">
      <h3 class="toolbar__title">Actions</h3>
      <div class="toolbar__buttons">
        <Button
          type="tertiary"
          size="small"
          @click="clearCanvas"
          title="Clear Canvas"
        >
          <Icon name="trash" size="small" />
        </Button>

        <Button
          type="tertiary"
          size="small"
          @click="saveStrategy"
          title="Save Strategy"
        >
          <Icon name="save" size="small" />
        </Button>

        <Button
          type="tertiary"
          size="small"
          @click="loadStrategy"
          title="Load Strategy"
        >
          <Icon name="download" size="small" />
        </Button>

        <Button
          type="tertiary"
          size="small"
          @click="exportImage"
          title="Export as Image"
        >
          <Icon name="download" size="small" />
        </Button>
      </div>
    </div>

    <div class="toolbar__section" v-if="currentTool === 'select'">
      <h3 class="toolbar__title">Select Mode</h3>
      <div class="keyboard-shortcuts">
        <div class="shortcut"><kbd>Delete</kbd> Delete object</div>
        <div class="shortcut"><kbd>↑↓←→</kbd> Move object</div>
        <div class="shortcut">
          <kbd>Shift</kbd> + <kbd>↑↓←→</kbd> Move faster
        </div>
        <div class="shortcut"><kbd>+</kbd> / <kbd>-</kbd> Scale object</div>
        <div class="shortcut"><kbd>R</kbd> Rotate 15°</div>
        <div class="shortcut"><kbd>Shift</kbd> + <kbd>R</kbd> Rotate -15°</div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Component imports
 */
import ColorSelector from "./ColorSelector.vue";

/**
 * Props
 */
const props = defineProps({
  canvas: {
    type: Object,
    default: null,
  },
});

/**
 * Emits
 */
const emit = defineEmits([
  "tool-changed",
  "clear-canvas",
  "save-strategy",
  "export-image",
]);

/**
 * Reactive data
 */
const currentTool = ref("select");
const brushSize = ref(3);
const brushColor = ref("#ef4444");
const fontSize = ref(16);
const textColor = ref("#000000");
const isOpen = ref(false);
const toggleHeight = ref(0);

/**
 * Methods
 */
const setTool = (tool) => {
  currentTool.value = tool;
  emit("tool-changed", {
    tool,
    brushSize: brushSize.value,
    brushColor: brushColor.value,
    fontSize: fontSize.value,
    textColor: textColor.value,
  });
};

const clearCanvas = () => {
  emit("clear-canvas");
};

const saveStrategy = () => {
  emit("save-strategy");
};

const loadStrategy = () => {
  emit("load-strategy");
};

const exportImage = () => {
  emit("export-image");
};

/**
 * Watch for brush changes
 */
watch([brushSize, brushColor], () => {
  if (currentTool.value === "draw" || currentTool.value === "erase") {
    emit("tool-changed", {
      tool: currentTool.value,
      brushSize: brushSize.value,
      brushColor: brushColor.value,
      fontSize: fontSize.value,
      textColor: textColor.value,
    });
  }
});

/**
 * Watch for text changes
 */
watch([fontSize, textColor], () => {
  if (currentTool.value === "text") {
    emit("tool-changed", {
      tool: currentTool.value,
      brushSize: brushSize.value,
      brushColor: brushColor.value,
      fontSize: fontSize.value,
      textColor: textColor.value,
    });
  }
});

/**
 * Initialize with select tool
 */
onMounted(() => {
  isOpen.value = false;
  setTool("select");
  toggleHeight.value = document.querySelector(".toolbar__section").offsetHeight;
});
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: rem(24);
  padding: rem(20);
  background: var(--blanc, #fff);
  border: 1px solid var(--gris, #e5e7eb);
  border-radius: rem(12);
  width: rem(280);
  height: rem(66);
  overflow: hidden;
  transition: height 0.3s ease-in-out;

  &__section {
    display: flex;
    flex-direction: column;
    gap: rem(12);
  }

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    color: var(--noir, #1f2937);
  }

  &__toggle-icon {
    transform: rotate(0deg);
    transition: transform 0.3s ease-in-out;

    &--open {
      transform: rotate(180deg);
    }
  }

  /* &__toggle:hover {
    color: var(--indigo, #3b82f6);
  } */

  &__title {
    font-size: rem(14);
    font-weight: 600;
    color: var(--noir, #1f2937);
    margin: 0;
    padding-bottom: rem(8);
    border-bottom: 1px solid var(--gris, #e5e7eb);
  }

  &__buttons {
    display: flex;
    gap: rem(8);
    flex-wrap: wrap;
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: rem(16);
  }

  &--open {
    height: calc(var(--toggle-height) + 100px);
  }
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: rem(6);

  .control-label {
    font-size: rem(12);
    font-weight: 500;
    color: var(--noir, #374151);
  }

  .control-value {
    font-size: rem(11);
    color: var(--gris, #6b7280);
    text-align: right;
  }
}

.range-input {
  width: 100%;
  height: rem(4);
  background: var(--gris, #e5e7eb);
  border-radius: rem(2);
  outline: none;
  appearance: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: rem(16);
    height: rem(16);
    background: var(--indigo, #3b82f6);
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: rem(16);
    height: rem(16);
    background: var(--indigo, #3b82f6);
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
}

.color-input {
  width: 100%;
  height: rem(32);
  border: 1px solid var(--gris, #e5e7eb);
  border-radius: rem(6);
  cursor: pointer;
  background: none;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: rem(4);
  }
}

.keyboard-shortcuts {
  display: flex;
  flex-direction: column;
  gap: rem(8);
}

.shortcut {
  display: flex;
  align-items: center;
  gap: rem(8);
  font-size: rem(11);
  color: var(--gris, #6b7280);
  line-height: 1.4;

  kbd {
    display: inline-block;
    padding: rem(2) rem(6);
    font-size: rem(10);
    font-weight: 600;
    color: var(--noir, #374151);
    background: var(--blanc, #f9fafb);
    border: 1px solid var(--gris, #d1d5db);
    border-radius: rem(4);
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
    font-family: inherit;
  }
}
</style>
