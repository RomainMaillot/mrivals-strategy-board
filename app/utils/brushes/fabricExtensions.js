/**
 * Fabric.js Extensions for Eraser Support
 * Adds erasable property and eraser functionality to Fabric.js objects
 */

import { FabricObject, Group, Canvas } from "fabric";
import "./fabricUtils.js";

// Track if extensions have already been applied
let extensionsApplied = false;

/**
 * Extend FabricObject prototype with erasable property
 */
export function extendFabricObjects() {
  // Only extend in browser environment
  if (typeof window === "undefined") {
    console.warn(
      "Fabric.js extensions can only be applied in browser environment"
    );
    return;
  }

  // Prevent multiple extensions
  if (extensionsApplied) {
    console.log("Fabric.js extensions already applied, skipping");
    return;
  }

  // Add erasable property to all Fabric objects (only if not already defined)
  if (!FabricObject.prototype.hasOwnProperty("erasable")) {
    FabricObject.prototype.erasable = true;
  }

  // Add eraser property to hold eraser paths (only if not already defined)
  if (!FabricObject.prototype.hasOwnProperty("eraser")) {
    FabricObject.prototype.eraser = undefined;
  }

  // Store original methods to avoid conflicts
  const originalMethods = {
    needsItsOwnCache: FabricObject.prototype.needsItsOwnCache,
    toObject: FabricObject.prototype.toObject,
    _drawClipPath: FabricObject.prototype._drawClipPath,
  };

  // Override needsItsOwnCache to account for eraser (only if not already overridden)
  if (!FabricObject.prototype._eraserNeedsItsOwnCacheOverridden) {
    FabricObject.prototype.needsItsOwnCache = function () {
      return originalMethods.needsItsOwnCache.call(this) || !!this.eraser;
    };
    FabricObject.prototype._eraserNeedsItsOwnCacheOverridden = true;
  }

  // Override toObject to include erasable and eraser properties (only if not already overridden)
  if (!FabricObject.prototype._eraserToObjectOverridden) {
    FabricObject.prototype.toObject = function (propertiesToInclude = []) {
      const object = originalMethods.toObject.call(
        this,
        ["erasable", "clipPath"].concat(propertiesToInclude)
      );

      if (this.eraser && !this.eraser.excludeFromExport) {
        object.eraser = this.eraser.toObject(propertiesToInclude);
      }

      // Debug clipPath serialization
      if (this.clipPath) {
        console.log("Serializing object with clipPath:", {
          type: this.type,
          hasClipPath: !!this.clipPath,
          clipPathInverted: this.clipPath.inverted,
          clipPathObjects: this.clipPath.getObjects
            ? this.clipPath.getObjects().length
            : 0,
        });
      }

      return object;
    };
    FabricObject.prototype._eraserToObjectOverridden = true;
  }

  // Simplified eraser approach - disable complex clip path override for now
  // The issue is that Fabric.js v6 has changed how clip paths work internally
  // Let's try a simpler approach by setting the eraser as the object's clipPath directly

  console.log(
    "Skipping complex _drawClipPath override due to Fabric.js v6 compatibility issues"
  );

  // Add canvas erasing support
  if (!Canvas.prototype._eraserIsErasingOverridden) {
    Canvas.prototype.isErasing = function () {
      return (
        this.isDrawingMode &&
        this.freeDrawingBrush &&
        this.freeDrawingBrush.type === "eraser" &&
        this.freeDrawingBrush._isErasing
      );
    };
    Canvas.prototype._eraserIsErasingOverridden = true;
  }

  // Override _renderOverlay to render eraser on top
  if (!Canvas.prototype._eraserRenderOverlayOverridden) {
    const originalRenderOverlay = Canvas.prototype._renderOverlay;
    Canvas.prototype._renderOverlay = function (ctx) {
      if (originalRenderOverlay) {
        originalRenderOverlay.call(this, ctx);
      }
      if (
        this.isErasing &&
        this.isErasing() &&
        !this.freeDrawingBrush.inverted
      ) {
        this.freeDrawingBrush._render();
      }
    };
    Canvas.prototype._eraserRenderOverlayOverridden = true;
  }

  // Mark extensions as applied
  extensionsApplied = true;
  console.log("Fabric.js objects extended with eraser support");
}

/**
 * Create an eraser group for an object
 * @param {FabricObject} object - The object to create an eraser for
 * @returns {Group} Eraser group
 */
export function createEraserForObject(object) {
  const eraser = new Group([], {
    originX: "center",
    originY: "center",
    excludeFromExport: false,
  });

  // Add a reference back to the parent object
  eraser.parentObject = object;

  return eraser;
}

export default {
  extendFabricObjects,
  createEraserForObject,
};
