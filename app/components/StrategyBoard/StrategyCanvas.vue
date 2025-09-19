<template>
  <div class="strategy-canvas">
    <ClientOnly>
      <canvas ref="canvasRef" :id="canvasId"></canvas>
      <template #fallback>
        <div class="canvas-loading">Loading canvas...</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import { Canvas, Circle, FabricText, Group, FabricImage } from "fabric";

// Import custom brushes and extensions
import { createBrush } from "~/utils/brushes";
import { extendFabricObjects } from "~/utils/brushes/fabricExtensions";

/**
 * Props
 */
const props = defineProps({
  canvasId: {
    type: String,
    default: "strategy-canvas",
  },
  width: {
    type: Number,
    default: 1200,
  },
  height: {
    type: Number,
    default: 800,
  },
  mapBackground: {
    type: String,
    default: null,
  },
});

/**
 * Emits
 */
const emit = defineEmits([
  "canvas-ready",
  "object-added",
  "object-modified",
  "canvas-changed",
]);

/**
 * Reactive data
 */
const canvasRef = ref(null);
const fabricCanvas = ref(null);
const isReady = ref(false);

/**
 * Initialize Fabric.js canvas
 */
const initCanvas = async () => {
  if (!canvasRef.value) return;

  // Initialize Fabric.js extensions for eraser support (only in browser)
  if (typeof window !== "undefined") {
    try {
      extendFabricObjects();
    } catch (error) {
      console.warn("Failed to extend Fabric.js objects:", error);
    }
  }

  // Create Fabric.js canvas
  fabricCanvas.value = new Canvas(canvasRef.value, {
    width: props.width,
    height: props.height,
    backgroundColor: "#ffffff",
    selection: true,
    preserveObjectStacking: true,
    // Improve rendering quality
    imageSmoothingEnabled: false,
    enableRetinaScaling: true,
    // Enable object controls
    centeredScaling: true,
    centeredRotation: true,
    // Improve interaction
    selectionBorderColor: "#3b82f6",
    selectionLineWidth: 2,
    selectionDashArray: [5, 5],
    // Prevent deselection on empty area click when in select mode
    skipTargetFind: false,
    // Improve control interaction
    targetFindTolerance: 5,
  });

  // Debug canvas dimensions and scaling
  console.log("=== CANVAS DIMENSIONS DEBUG ===");
  console.log("Props dimensions:", {
    width: props.width,
    height: props.height,
  });
  console.log("Canvas element dimensions:", {
    width: canvasRef.value.width,
    height: canvasRef.value.height,
    clientWidth: canvasRef.value.clientWidth,
    clientHeight: canvasRef.value.clientHeight,
    offsetWidth: canvasRef.value.offsetWidth,
    offsetHeight: canvasRef.value.offsetHeight,
  });
  console.log("Fabric canvas dimensions:", {
    width: fabricCanvas.value.width,
    height: fabricCanvas.value.height,
    getWidth: fabricCanvas.value.getWidth(),
    getHeight: fabricCanvas.value.getHeight(),
  });
  console.log("Canvas scaling:", {
    retinaScaling: fabricCanvas.value.enableRetinaScaling,
    devicePixelRatio: window.devicePixelRatio || 1,
  });

  // Check if there are multiple canvas elements
  const upperCanvas = fabricCanvas.value.upperCanvasEl;
  const lowerCanvas = fabricCanvas.value.lowerCanvasEl;
  console.log("Upper canvas (drawing layer):", {
    width: upperCanvas?.width,
    height: upperCanvas?.height,
    clientWidth: upperCanvas?.clientWidth,
    clientHeight: upperCanvas?.clientHeight,
    style: upperCanvas?.style.cssText,
  });
  console.log("Lower canvas (static layer):", {
    width: lowerCanvas?.width,
    height: lowerCanvas?.height,
    clientWidth: lowerCanvas?.clientWidth,
    clientHeight: lowerCanvas?.clientHeight,
    style: lowerCanvas?.style.cssText,
  });

  // Set up event listeners
  setupCanvasEvents();

  // Load map background if provided
  if (props.mapBackground) {
    await loadMapBackground(props.mapBackground);
  }

  isReady.value = true;
  emit("canvas-ready", fabricCanvas.value);
};

/**
 * Set up canvas event listeners
 */
const setupCanvasEvents = () => {
  if (!fabricCanvas.value) return;

  // Object events
  fabricCanvas.value.on("object:added", (e) => {
    // Enable controls for new objects
    if (e.target && e.target.selectable !== false) {
      setupObjectControls(e.target);
    }
    emit("object-added", e.target);
    emit("canvas-changed");
  });

  fabricCanvas.value.on("object:modified", (e) => {
    emit("object-modified", e.target);
    emit("canvas-changed");
  });

  fabricCanvas.value.on("object:removed", () => {
    emit("canvas-changed");
  });

  // Selection events
  fabricCanvas.value.on("selection:created", (e) => {
    console.log("Selection created:", e.selected);
    // Enable keyboard controls when object is selected
    setupKeyboardControls();
  });

  fabricCanvas.value.on("selection:cleared", () => {
    console.log("Selection cleared");
    // Remove keyboard controls when nothing is selected
    removeKeyboardControls();
  });

  // Debug mouse events to check coordinate accuracy for drawing offset issues
  fabricCanvas.value.on("mouse:down", (e) => {
    if (fabricCanvas.value.isDrawingMode) {
      const pointer = fabricCanvas.value.getPointer(e.e);
      console.log("=== MOUSE DOWN DEBUG ===");
      console.log("Canvas pointer:", pointer);
      console.log("Raw mouse event:", {
        clientX: e.e.clientX,
        clientY: e.e.clientY,
        offsetX: e.e.offsetX,
        offsetY: e.e.offsetY,
      });
      console.log(
        "Canvas bounds:",
        fabricCanvas.value.upperCanvasEl.getBoundingClientRect()
      );
      console.log("Drawing mode:", fabricCanvas.value.isDrawingMode);
      console.log(
        "Brush type:",
        fabricCanvas.value.freeDrawingBrush?.constructor?.name
      );
    }
  });

  // Object scaling and rotation events
  fabricCanvas.value.on("object:scaling", (e) => {
    // Maintain aspect ratio for character icons
    if (e.target && e.target.characterId) {
      const obj = e.target;
      const scale = Math.max(obj.scaleX, obj.scaleY);
      obj.set({ scaleX: scale, scaleY: scale });
    }
  });

  // Prevent deselection when clicking on controls
  fabricCanvas.value.on("mouse:down", (e) => {
    const activeObject = fabricCanvas.value.getActiveObject();

    // If we have an active object and we're clicking on it or its controls, don't deselect
    if (activeObject && e.target === activeObject) {
      e.e.preventDefault?.();
    }
  });

  // Handle control interaction
  fabricCanvas.value.on("object:moving", () => {
    // Object is being moved - ensure it stays selected
  });

  fabricCanvas.value.on("object:rotating", () => {
    // Object is being rotated - ensure it stays selected
  });
};

/**
 * Set up controls for individual objects
 */
const setupObjectControls = (obj) => {
  if (!obj) return;

  // Enable all transformation controls
  obj.set({
    cornerSize: 14,
    cornerStyle: "circle",
    cornerColor: "#3b82f6",
    cornerStrokeColor: "#1e40af",
    borderColor: "#3b82f6",
    borderScaleFactor: 2,
    borderOpacityWhenMoving: 0.5,
    hasRotatingPoint: true,
    rotatingPointOffset: 40,
    transparentCorners: false,
    // Enable all controls
    lockMovementX: false,
    lockMovementY: false,
    lockRotation: false,
    lockScalingX: false,
    lockScalingY: false,
    lockUniScaling: false,
    // Improve control responsiveness
    padding: 10,
    hoverCursor: "move",
    moveCursor: "move",
  });

  // For character groups, maintain aspect ratio
  if (obj.characterId) {
    obj.set({
      lockUniScaling: true, // Force uniform scaling
    });
  }

  // Ensure the object is properly configured for interaction
  obj.setCoords();
};

/**
 * Keyboard controls for selected objects
 */
let keyboardHandler = null;

const setupKeyboardControls = () => {
  removeKeyboardControls(); // Remove any existing handler

  keyboardHandler = (e) => {
    if (!fabricCanvas.value) return;

    const activeObject = fabricCanvas.value.getActiveObject();
    if (!activeObject || activeObject.selectable === false) return;

    // Prevent default behavior for our handled keys
    const handledKeys = [
      "Delete",
      "Backspace",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
    ];
    if (handledKeys.includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key) {
      case "Delete":
      case "Backspace":
        deleteSelectedObject();
        break;

      case "ArrowUp":
        moveObject(activeObject, 0, e.shiftKey ? -10 : -1);
        break;

      case "ArrowDown":
        moveObject(activeObject, 0, e.shiftKey ? 10 : 1);
        break;

      case "ArrowLeft":
        moveObject(activeObject, e.shiftKey ? -10 : -1, 0);
        break;

      case "ArrowRight":
        moveObject(activeObject, e.shiftKey ? 10 : 1, 0);
        break;

      case "+":
      case "=":
        scaleObject(activeObject, 1.1);
        break;

      case "-":
      case "_":
        scaleObject(activeObject, 0.9);
        break;

      case "r":
      case "R":
        if (e.ctrlKey || e.metaKey) return; // Don't interfere with browser refresh
        rotateObject(activeObject, e.shiftKey ? -15 : 15);
        break;
    }
  };

  document.addEventListener("keydown", keyboardHandler);
};

const removeKeyboardControls = () => {
  if (keyboardHandler) {
    document.removeEventListener("keydown", keyboardHandler);
    keyboardHandler = null;
  }
};

/**
 * Helper functions for object manipulation
 */
const deleteSelectedObject = () => {
  if (!fabricCanvas.value) return;

  const activeObject = fabricCanvas.value.getActiveObject();
  if (activeObject && activeObject.selectable !== false) {
    fabricCanvas.value.remove(activeObject);
    fabricCanvas.value.discardActiveObject();
    fabricCanvas.value.renderAll();
  }
};

const moveObject = (obj, deltaX, deltaY) => {
  if (!obj || !fabricCanvas.value) return;

  obj.set({
    left: obj.left + deltaX,
    top: obj.top + deltaY,
  });

  obj.setCoords();
  fabricCanvas.value.renderAll();
  emit("canvas-changed");
};

const scaleObject = (obj, scaleFactor) => {
  if (!obj || !fabricCanvas.value) return;

  const newScaleX = obj.scaleX * scaleFactor;
  const newScaleY = obj.scaleY * scaleFactor;

  // Prevent objects from becoming too small or too large
  const minScale = 0.1;
  const maxScale = 5;

  if (newScaleX >= minScale && newScaleX <= maxScale) {
    obj.set({
      scaleX: newScaleX,
      scaleY: obj.characterId ? newScaleX : newScaleY, // Maintain aspect ratio for characters
    });

    obj.setCoords();
    fabricCanvas.value.renderAll();
    emit("canvas-changed");
  }
};

const rotateObject = (obj, deltaAngle) => {
  if (!obj || !fabricCanvas.value) return;

  const newAngle = (obj.angle + deltaAngle) % 360;
  obj.set({ angle: newAngle });

  obj.setCoords();
  fabricCanvas.value.renderAll();
  emit("canvas-changed");
};

/**
 * Load map background image
 */
const loadMapBackground = async (imageUrl) => {
  if (!fabricCanvas.value) {
    console.log("Canvas not ready, cannot load background");
    return;
  }

  if (imageUrl === null) {
    console.log("No image URL provided, clearing background");
    fabricCanvas.value.backgroundImage = null;
    fabricCanvas.value.renderAll();
    return;
  }

  console.log("Loading background image:", imageUrl);

  try {
    // Try the Promise-based approach first (Fabric.js v6)
    const img = await FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    });

    console.log("Image loaded successfully:", img);
    console.log("Image dimensions:", img.width, "x", img.height);

    // Scale image to fit canvas
    const scaleX = props.width / img.width;
    const scaleY = props.height / img.height;
    const scale = Math.min(scaleX, scaleY);

    console.log("Scaling factor:", scale);

    img.set({
      scaleX: scale,
      scaleY: scale,
      left: (props.width - img.width * scale) / 2,
      top: (props.height - img.height * scale) / 2,
      selectable: false,
      evented: false,
      moveCursor: "default",
      hoverCursor: "default",
      erasable: false, // Protect background from eraser
    });

    console.log("Setting background image on canvas");

    // Add as background - try different approaches for Fabric.js v6
    try {
      // Method 1: Try setBackgroundImage if it exists
      if (typeof fabricCanvas.value.setBackgroundImage === "function") {
        fabricCanvas.value.setBackgroundImage(img);
      } else {
        // Method 2: Try setting backgroundImage property directly
        fabricCanvas.value.backgroundImage = img;
      }

      console.log("Background set, rendering canvas");
      fabricCanvas.value.renderAll();
    } catch (bgError) {
      console.error("Error setting background:", bgError);

      // Method 3: Add as regular object but send to back
      console.log("Trying to add as regular object...");
      fabricCanvas.value.add(img);
      fabricCanvas.value.sendObjectToBack(img);
      fabricCanvas.value.renderAll();
    }
  } catch (error) {
    console.error("Failed to load background image:", error);

    // Fallback: try the callback approach
    console.log("Trying callback approach...");
    FabricImage.fromURL(
      imageUrl,
      (img) => {
        console.log("Image loaded with callback:", img);

        // Scale image to fit canvas
        const scaleX = props.width / img.width;
        const scaleY = props.height / img.height;
        const scale = Math.min(scaleX, scaleY);

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (props.width - img.width * scale) / 2,
          top: (props.height - img.height * scale) / 2,
          selectable: false,
          evented: false,
          moveCursor: "default",
          hoverCursor: "default",
          erasable: false, // Protect background from eraser
        });

        // Try different background setting methods
        if (typeof fabricCanvas.value.setBackgroundImage === "function") {
          fabricCanvas.value.setBackgroundImage(img);
        } else {
          fabricCanvas.value.backgroundImage = img;
        }
        fabricCanvas.value.renderAll();
      },
      {
        crossOrigin: "anonymous",
      }
    );
  }
};

/**
 * Public methods (exposed to parent)
 */
const addCharacter = (characterData, position) => {
  if (!fabricCanvas.value) return;

  // Create character icon
  const character = new Circle({
    left: position.x,
    top: position.y,
    radius: 30,
    fill: characterData.color || "#3b82f6",
    stroke: "#1e40af",
    strokeWidth: 3,
    originX: "center",
    originY: "center",
    erasable: true, // Allow eraser to affect character icons
    // Custom properties
    characterId: characterData.id,
    characterName: characterData.name,
    characterRole: characterData.role,
  });

  // Add character name text
  const nameText = new FabricText(characterData.name, {
    left: position.x,
    top: position.y + 40,
    fontSize: 12,
    fontFamily: "Arial",
    textAlign: "center",
    erasable: true, // Allow eraser to affect character names
    originX: "center",
    originY: "center",
    fill: "#EBEBEB",
    selectable: false,
    evented: false,
  });

  // Group character and text
  const characterGroup = new Group([character, nameText], {
    left: position.x,
    top: position.y,
    originX: "center",
    originY: "center",
    // Ensure the group is selectable and interactive
    selectable: true,
    evented: true,
    // Add character metadata
    characterId: characterData.id,
    characterName: characterData.name,
    characterRole: characterData.role,
  });

  // Set up controls before adding to canvas
  setupObjectControls(characterGroup);

  fabricCanvas.value.add(characterGroup);
  fabricCanvas.value.setActiveObject(characterGroup);
  fabricCanvas.value.renderAll();
};

const enableDrawingMode = async (brushType = "pencil", options = {}) => {
  if (!fabricCanvas.value) return;

  fabricCanvas.value.isDrawingMode = true;

  try {
    // Use the brush factory to create the appropriate brush
    const brush = await createBrush(brushType, fabricCanvas.value, options);
    fabricCanvas.value.freeDrawingBrush = brush;

    console.log(`Enabled ${brushType} brush with options:`, options);
  } catch (error) {
    console.error("Error creating brush:", error);

    // Fallback to pencil brush
    try {
      const fallbackBrush = await createBrush(
        "pencil",
        fabricCanvas.value,
        options
      );
      fabricCanvas.value.freeDrawingBrush = fallbackBrush;
    } catch (fallbackError) {
      console.error("Failed to create fallback brush:", fallbackError);
      fabricCanvas.value.isDrawingMode = false;
    }
  }
};

const disableDrawingMode = () => {
  if (!fabricCanvas.value) return;
  fabricCanvas.value.isDrawingMode = false;

  // Ensure all objects have proper controls when switching to select mode
  fabricCanvas.value.getObjects().forEach((obj) => {
    if (obj.selectable !== false) {
      setupObjectControls(obj);
    }
  });

  // Re-render to ensure controls are visible
  fabricCanvas.value.renderAll();
};

const clearCanvas = async () => {
  if (!fabricCanvas.value) return;
  fabricCanvas.value.clear();
  if (props.mapBackground) {
    await loadMapBackground(props.mapBackground);
  }
};

const exportCanvas = () => {
  if (!fabricCanvas.value) return null;
  return fabricCanvas.value.toJSON([
    "characterId",
    "characterName",
    "characterRole",
  ]);
};

const importCanvas = (data) => {
  if (!fabricCanvas.value) return;
  fabricCanvas.value.loadFromJSON(data, () => {
    fabricCanvas.value.renderAll();
  });
};

/**
 * Lifecycle
 */
onMounted(() => {
  nextTick(async () => {
    await initCanvas();
  });
});

onBeforeUnmount(() => {
  // Clean up keyboard event listeners
  removeKeyboardControls();

  // Dispose of the canvas
  if (fabricCanvas.value) {
    fabricCanvas.value.dispose();
  }
});

/**
 * Watch for prop changes
 */
watch(
  () => props.mapBackground,
  async (newBackground) => {
    if (fabricCanvas.value) {
      await loadMapBackground(newBackground);
    }
  }
);

/**
 * Public methods for object manipulation
 */
const deleteSelected = () => {
  deleteSelectedObject();
};

const duplicateSelected = () => {
  if (!fabricCanvas.value) return;

  const activeObject = fabricCanvas.value.getActiveObject();
  if (activeObject && activeObject.selectable !== false) {
    activeObject.clone((cloned) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
      });

      if (cloned.characterId) {
        // Generate new ID for duplicated character
        cloned.characterId = cloned.characterId + "_copy_" + Date.now();
      }

      setupObjectControls(cloned);
      fabricCanvas.value.add(cloned);
      fabricCanvas.value.setActiveObject(cloned);
      fabricCanvas.value.renderAll();
    });
  }
};

const bringToFront = () => {
  if (!fabricCanvas.value) return;

  const activeObject = fabricCanvas.value.getActiveObject();
  if (activeObject && activeObject.selectable !== false) {
    fabricCanvas.value.bringToFront(activeObject);
    fabricCanvas.value.renderAll();
  }
};

const sendToBack = () => {
  if (!fabricCanvas.value) return;

  const activeObject = fabricCanvas.value.getActiveObject();
  if (activeObject && activeObject.selectable !== false) {
    fabricCanvas.value.sendToBack(activeObject);
    fabricCanvas.value.renderAll();
  }
};

/**
 * Expose methods to parent
 */
defineExpose({
  addCharacter,
  enableDrawingMode,
  disableDrawingMode,
  clearCanvas,
  exportCanvas,
  importCanvas,
  deleteSelected,
  duplicateSelected,
  bringToFront,
  sendToBack,
  fabricCanvas,
  isReady,
});
</script>

<style lang="scss" scoped>
.strategy-canvas {
  position: relative;
  border: 2px solid var(--gris, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;

  canvas {
    display: block;
    cursor: crosshair;
    outline: none; // Remove focus outline
  }

  &.drawing-mode canvas {
    cursor: crosshair;
  }

  &.select-mode canvas {
    cursor: default;
  }

  // Ensure control handles are visible
  :deep(.upper-canvas) {
    pointer-events: auto;
  }
}

.canvas-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: rem(400);
  font-size: rem(16);
  color: var(--gris, #6b7280);
  background: var(--blanc, #f8f9fa);
}
</style>
