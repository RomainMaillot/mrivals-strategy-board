<template>
  <div class="strategy-board">
    <div class="strategy-board__header">
      <CText type="h1" class="strategy-board__title"
        >Marvel Rivals Strategy Board</CText
      >
      <div class="strategy-board__actions">
        <Button @click="newStrategy" type="tertiary" size="small">
          New Strategy
        </Button>
        <Button @click="saveStrategy" type="primary" size="small">
          Save Strategy
        </Button>
      </div>
    </div>

    <div class="strategy-board__content">
      <!-- Left Panel: Tools -->
      <div class="strategy-board__sidebar strategy-board__sidebar--left">
        <ToolBar
          :canvas="canvas"
          @tool-changed="onToolChanged"
          @clear-canvas="clearCanvas"
          @save-strategy="saveStrategy"
          @export-image="exportImage"
        />
      </div>

      <!-- Main Canvas Area -->
      <div class="strategy-board__main">
        <div class="canvas-container" @drop="onDrop" @dragover.prevent>
          <StrategyCanvas
            ref="canvasRef"
            :width="1200"
            :height="800"
            :map-background="selectedMap"
            @canvas-ready="onCanvasReady"
            @canvas-changed="onCanvasChanged"
          />

          <!-- Drop indicator -->
          <div v-if="isDragOver" class="drop-indicator">
            Drop character here
          </div>
        </div>
      </div>

      <!-- Right Panel: Characters & Maps -->
      <div class="strategy-board__sidebar strategy-board__sidebar--right">
        <div
          class="sidebar-tabs"
          :class="{ 'sidebar-tabs--hide': activeTab === 'hide' }"
        >
          <Button
            :type="activeTab === 'characters' ? 'secondary' : 'tertiary'"
            size="small"
            title="Characters"
            @click="activeTab = 'characters'"
          />
          <Button
            :type="activeTab === 'maps' ? 'secondary' : 'tertiary'"
            size="small"
            title="Maps"
            @click="activeTab = 'maps'"
          />
          <Button
            :type="activeTab === 'hide' ? 'secondary' : 'tertiary'"
            size="small"
            title="Hide"
            @click="activeTab = 'hide'"
          />
        </div>

        <CharacterPanel
          v-if="activeTab === 'characters'"
          :canvas="canvas"
          @character-selected="onCharacterSelected"
        />

        <MapSelector
          v-if="activeTab === 'maps'"
          :selected-map="selectedMap"
          @map-selected="onMapSelected"
        />
      </div>
    </div>

    <!-- Status Bar -->
    <div class="strategy-board__status">
      <span class="status-item">
        Current Tool: <strong>{{ currentTool }}</strong>
      </span>
      <span class="status-item" v-if="selectedCharacter">
        Selected: <strong>{{ selectedCharacter.name }}</strong>
      </span>
      <span class="status-item">
        Objects: <strong>{{ objectCount }}</strong>
      </span>
    </div>
  </div>
</template>

<script setup>
/**
 * Component imports
 */
import StrategyCanvas from "./StrategyCanvas.vue";
import ToolBar from "./ToolBar.vue";
import CharacterPanel from "./CharacterPanel.vue";
import MapSelector from "./MapSelector.vue";

/**
 * Reactive data
 */
const canvasRef = ref(null);
const canvas = ref(null);
const currentTool = ref("select");
const selectedCharacter = ref(null);
const selectedMap = ref(null);
const objectCount = ref(0);
const isDragOver = ref(false);
const hasUnsavedChanges = ref(false);
const activeTab = ref("characters");

/**
 * Methods
 */
const onCanvasReady = (fabricCanvas) => {
  canvas.value = fabricCanvas;
  console.log("Canvas ready:", fabricCanvas);
};

const onCanvasChanged = () => {
  hasUnsavedChanges.value = true;
  updateObjectCount();
};

const updateObjectCount = () => {
  if (canvas.value) {
    objectCount.value = canvas.value.getObjects().length;
  }
};

const onToolChanged = (toolData) => {
  currentTool.value = toolData.tool;

  if (!canvasRef.value) return;

  switch (toolData.tool) {
    case "select":
      canvasRef.value.disableDrawingMode();
      break;
    case "draw":
      canvasRef.value.enableDrawingMode("PencilBrush", {
        width: toolData.brushSize,
        color: toolData.brushColor,
      });
      break;
    case "erase":
      canvasRef.value.enableDrawingMode("EraserBrush", {
        width: toolData.brushSize,
      });
      break;
  }
};

const onCharacterSelected = (character) => {
  selectedCharacter.value = character;
};

const onMapSelected = (mapBackground) => {
  selectedMap.value = mapBackground;
  console.log("Map selected:", mapBackground);
};

const onDrop = (event) => {
  event.preventDefault();
  isDragOver.value = false;

  try {
    const characterData = JSON.parse(
      event.dataTransfer.getData("application/json")
    );
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (canvasRef.value) {
      canvasRef.value.addCharacter(characterData, { x, y });
    }
  } catch (error) {
    console.error("Error dropping character:", error);
  }
};

const clearCanvas = () => {
  if (canvasRef.value) {
    canvasRef.value.clearCanvas();
    hasUnsavedChanges.value = false;
  }
};

const newStrategy = () => {
  if (hasUnsavedChanges.value) {
    const confirmed = confirm(
      "You have unsaved changes. Are you sure you want to create a new strategy?"
    );
    if (!confirmed) return;
  }

  clearCanvas();
  selectedCharacter.value = null;
};

const saveStrategy = () => {
  if (!canvasRef.value) return;

  const strategyData = canvasRef.value.exportCanvas();
  const strategyName =
    prompt("Enter a name for this strategy:") || "Untitled Strategy";

  // For now, save to localStorage (in a real app, you'd save to a backend)
  const savedStrategies = JSON.parse(
    localStorage.getItem("marvelRivalsStrategies") || "[]"
  );
  savedStrategies.push({
    id: Date.now(),
    name: strategyName,
    data: strategyData,
    createdAt: new Date().toISOString(),
  });

  localStorage.setItem(
    "marvelRivalsStrategies",
    JSON.stringify(savedStrategies)
  );
  hasUnsavedChanges.value = false;

  alert(`Strategy "${strategyName}" saved successfully!`);
};

const exportImage = () => {
  if (!canvas.value) return;

  const dataURL = canvas.value.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "marvel-rivals-strategy.png";
  link.href = dataURL;
  link.click();
};

/**
 * Drag and drop handlers
 */
const onDragOver = (event) => {
  event.preventDefault();
  isDragOver.value = true;
};

const onDragLeave = () => {
  isDragOver.value = false;
};

/**
 * Lifecycle
 */
onMounted(() => {
  // Add global drag and drop listeners
  document.addEventListener("dragover", onDragOver);
  document.addEventListener("dragleave", onDragLeave);
});

onBeforeUnmount(() => {
  document.removeEventListener("dragover", onDragOver);
  document.removeEventListener("dragleave", onDragLeave);
});
</script>

<style lang="scss" scoped>
.strategy-board {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--gris, #f3f4f6);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: rem(16) rem(24);
    background: var(--blanc, #fff);
    border-bottom: 1px solid var(--gris, #e5e7eb);
  }

  &__title {
    font-size: rem(24);
    font-weight: 700;
    color: var(--noir, #1f2937);
    margin: 0;
  }

  &__actions {
    display: flex;
    gap: rem(12);
  }

  &__content {
    display: flex;
    flex: 1;
    gap: rem(16);
    padding: rem(16);
    overflow: hidden;
  }

  &__sidebar {
    flex-shrink: 0;

    &--left {
      order: 1;
      position: fixed;
      left: rem(24);
      top: rem(70);
      bottom: 0;
      z-index: 1;
      height: fit-content;
    }

    &--right {
      order: 3;
      position: fixed;
      right: rem(24);
      top: rem(70);
      bottom: 0;
      z-index: 1;
      display: flex;
      flex-direction: column;
      height: fit-content;
    }
  }

  &__main {
    flex: 1;
    order: 2;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__status {
    display: flex;
    gap: rem(24);
    padding: rem(12) rem(24);
    background: var(--blanc, #fff);
    border-top: 1px solid var(--gris, #e5e7eb);
    font-size: rem(12);
    color: var(--gris, #6b7280);
  }
}

.canvas-container {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--blanc, #fff);
  border-radius: rem(12);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.drop-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.1);
  border: 2px dashed var(--indigo, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: rem(18);
  font-weight: 600;
  color: var(--indigo, #3b82f6);
  pointer-events: none;
  z-index: 10;
}

.status-item {
  display: flex;
  align-items: center;
  gap: rem(4);

  strong {
    color: var(--noir, #1f2937);
  }
}

.sidebar-tabs {
  display: flex;
  gap: rem(8);
  padding: rem(16);
  background: var(--blanc, #fff);
  border-radius: rem(8) rem(8) 0 0;
  border: 1px solid var(--gris, #e5e7eb);
  border-bottom: none;

  &--hide {
    border-radius: rem(8);
    border-bottom: 1px solid var(--gris, #e5e7eb);
  }
}
</style>
