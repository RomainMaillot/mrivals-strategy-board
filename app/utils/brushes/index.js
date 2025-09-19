/**
 * Brush exports for the Strategy Board
 * Centralized location for all custom brushes
 */

// Re-export Fabric.js brushes for convenience
export { PencilBrush, BaseBrush } from "fabric";
import "./fabricUtils.js";

/**
 * Brush factory function
 * @param {string} type - Brush type ('pencil', 'eraser')
 * @param {Object} canvas - Fabric.js canvas instance
 * @param {Object} options - Brush options
 * @returns {Promise<BaseBrush>} Brush instance
 */
export async function createBrush(type, canvas, options = {}) {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error("Brushes can only be created in browser environment");
  }

  try {
    switch (type) {
      case "pencil": {
        const { CustomPencilBrush } = await import("./CustomPencilBrush.js");
        const pencilBrush = new CustomPencilBrush(canvas);
        pencilBrush.updateOptions(options);
        return pencilBrush;
      }

      case "eraser": {
        // Use the official EraserBrush from @erase2d/fabric
        const { EraserBrush } = await import("@erase2d/fabric");
        const eraserBrush = new EraserBrush(canvas);
        if (options.width) eraserBrush.width = options.width;
        if (options.inverted !== undefined)
          eraserBrush.inverted = options.inverted;
        console.log("Created official EraserBrush from @erase2d/fabric");
        return eraserBrush;
      }

      default:
        throw new Error(`Unknown brush type: ${type}`);
    }
  } catch (error) {
    console.error(`Failed to create ${type} brush:`, error);
    throw error;
  }
}

export default {
  createBrush,
};
