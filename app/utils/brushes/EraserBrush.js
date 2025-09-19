import { PencilBrush, Path, Group, FabricObject, util } from "fabric";
import "./fabricUtils.js";

/**
 * EraserBrush class for Fabric.js v6
 * Adapted from the original Fabric.js eraser implementation
 *
 * This brush creates erasing functionality by:
 * 1. Using destination-out composite operation to erase parts of objects
 * 2. Creating eraser paths that are applied to intersecting objects
 * 3. Supporting selective erasing (only erasable objects are affected)
 */
export class EraserBrush extends PencilBrush {
  constructor(canvas) {
    super(canvas);

    this.type = "eraser";
    this.inverted = false;
    this._isErasing = false;
    this.width = 10;
    this.color = "rgba(0,0,0,1)"; // Will be overridden by composite operation
    this.decimate = 0.4; // Point decimation distance
    this._points = []; // Points array for path creation
  }

  /**
   * Check if an object is erasable
   * @private
   * @param {FabricObject} object
   * @returns {boolean}
   */
  _isErasable(object) {
    return object.erasable !== false;
  }

  /**
   * Prepare the pattern for erasing
   * This creates a canvas with non-erasable objects to mask the erasing effect
   * @private
   */
  preparePattern() {
    if (!this._patternCanvas) {
      // Use Fabric.js utility to create canvas element if available
      this._patternCanvas =
        typeof fabric !== "undefined" &&
        fabric.util &&
        fabric.util.createCanvasElement
          ? fabric.util.createCanvasElement()
          : document.createElement("canvas");
    }

    const canvas = this._patternCanvas;
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;

    console.log("Preparing pattern canvas:", canvas.width, "x", canvas.height);

    const patternCtx = canvas.getContext("2d");

    // Handle retina scaling properly like original
    if (this.canvas._isRetinaScaling && this.canvas._isRetinaScaling()) {
      const retinaScaling = this.canvas.getRetinaScaling();
      if (this.canvas.__initRetinaScaling) {
        this.canvas.__initRetinaScaling(retinaScaling, canvas, patternCtx);
      } else {
        canvas.width *= retinaScaling;
        canvas.height *= retinaScaling;
        patternCtx.scale(retinaScaling, retinaScaling);
      }
    }

    // Render background if it's not erasable (matching original logic)
    const backgroundImage = this.canvas.backgroundImage;
    const bgErasable = backgroundImage && this._isErasable(backgroundImage);

    if (
      !this.inverted &&
      ((backgroundImage && !bgErasable) || this.canvas.backgroundColor)
    ) {
      if (bgErasable) {
        this.canvas.backgroundImage = undefined;
      }
      this.canvas._renderBackground(patternCtx);
      if (bgErasable) {
        this.canvas.backgroundImage = backgroundImage;
      }
    }

    // Save context and apply viewport transform
    patternCtx.save();
    if (this.canvas.viewportTransform) {
      patternCtx.transform(...this.canvas.viewportTransform);
    }

    // Prepare collection traversal like original
    const restorationContext = { visibility: [], eraser: [], collection: [] };
    this._prepareCollectionTraversal(
      this.canvas,
      patternCtx,
      restorationContext
    );

    // Render objects
    this.canvas._renderObjects(patternCtx, this.canvas.getObjects());

    // Restore state
    restorationContext.visibility.forEach((obj) => {
      obj.visible = true;
    });
    restorationContext.eraser.forEach((obj) => {
      if (obj.eraser) {
        obj.eraser.inverted = false;
        obj.dirty = true;
      }
    });
    restorationContext.collection.forEach((obj) => {
      obj.dirty = true;
    });

    patternCtx.restore();
  }

  /**
   * Prepare collection traversal like original implementation
   * @private
   * @param {Object} collection
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} restorationContext
   */
  _prepareCollectionTraversal(collection, ctx, restorationContext) {
    const objects = collection.getObjects
      ? collection.getObjects()
      : collection._objects || [];

    objects.forEach((obj) => {
      if (obj.forEachObject && obj.erasable === "deep") {
        // Traverse nested collections
        this._prepareCollectionTraversal(obj, ctx, restorationContext);
      } else if (!this.inverted && obj.erasable && obj.visible) {
        // Hide erasable objects for non-inverted mode
        obj.visible = false;
        if (collection.dirty !== undefined) collection.dirty = true;
        restorationContext.visibility.push(obj);
        restorationContext.collection.push(collection);
      } else if (this.inverted && obj.visible) {
        // Handle inverted mode
        if (obj.erasable && obj.eraser) {
          obj.eraser.inverted = true;
          obj.dirty = true;
          if (collection.dirty !== undefined) collection.dirty = true;
          restorationContext.eraser.push(obj);
          restorationContext.collection.push(collection);
        } else {
          obj.visible = false;
          if (collection.dirty !== undefined) collection.dirty = true;
          restorationContext.visibility.push(obj);
          restorationContext.collection.push(collection);
        }
      }
    });
  }

  /**
   * Set brush styles for erasing
   * @private
   * @param {CanvasRenderingContext2D} ctx
   */
  _setBrushStyles(ctx) {
    super._setBrushStyles(ctx);
    ctx.strokeStyle = "black";
    ctx.lineWidth = this.width;
    ctx.lineCap = this.strokeLineCap || "round";
    ctx.lineJoin = this.strokeLineJoin || "round";
  }

  /**
   * Save and transform context for erasing
   * @override
   * @private
   * @param {CanvasRenderingContext2D} ctx
   */
  _saveAndTransform(ctx) {
    super._saveAndTransform(ctx);
    this._setBrushStyles(ctx);

    // Use destination-out for main canvas (actual erasing)
    // Use source-over for top canvas (preview)
    ctx.globalCompositeOperation =
      ctx === this.canvas.getContext() ? "destination-out" : "source-over";
  }

  /**
   * Handle mouse down - start erasing
   * @param {Object} pointer
   * @param {Object} options
   */
  onMouseDown(pointer, options) {
    if (!this.canvas._isMainEvent?.(options.e)) {
      return;
    }

    // Initialize drawing state
    this._setBrushStyles(this.canvas.contextTop);
    this._setShadow();

    // Start the path
    this._points = [];
    this._points.push(this.canvas.getPointer(options.e));

    // Prepare for erasing
    this.preparePattern();
    this._isErasing = true;

    this.canvas.fire("erasing:start");
    this._render();
  }

  /**
   * Handle mouse move - continue erasing
   * @param {Object} pointer
   * @param {Object} options
   */
  onMouseMove(pointer, options) {
    if (!this._isErasing) return;

    const point = this.canvas.getPointer(options.e);
    this._points.push(point);
    this._render();
  }

  /**
   * Handle mouse up - finish erasing
   * @param {Object} options
   */
  onMouseUp(options) {
    if (!this._isErasing) return;

    this._isErasing = false;
    this._finalizeAndAddPath();
  }

  /**
   * Custom render method for eraser - matches original dual canvas logic
   * @private
   */
  _render() {
    let ctx;

    if (!this.inverted) {
      // Clip canvas by rendering on main context (destination-out)
      ctx = this.canvas.getContext();
      this._renderPath(ctx);
    }

    // Render brush with pattern mask on top context
    ctx = this.canvas.contextTop;
    this.canvas.clearContext(ctx);
    this._renderPath(ctx);

    // Apply pattern masking
    if (this._patternCanvas && this._patternCanvas.width > 0) {
      ctx.save();
      const retinaScaling = this.canvas.getRetinaScaling
        ? this.canvas.getRetinaScaling()
        : 1;
      const scale = 1 / retinaScaling;
      ctx.scale(scale, scale);
      ctx.globalCompositeOperation = "source-in";
      ctx.drawImage(this._patternCanvas, 0, 0);
      ctx.restore();
    }
  }

  /**
   * Render the eraser path on given context
   * @private
   * @param {CanvasRenderingContext2D} ctx
   */
  _renderPath(ctx) {
    if (!this._points || this._points.length < 2) return;

    this._saveAndTransform(ctx);

    ctx.beginPath();
    ctx.moveTo(this._points[0].x, this._points[0].y);

    for (let i = 1; i < this._points.length; i++) {
      ctx.lineTo(this._points[i].x, this._points[i].y);
    }

    ctx.stroke();
    ctx.restore();
  }

  /**
   * We indicate to repaint if necessary
   * @returns {boolean}
   */
  needsFullRender() {
    return true;
  }

  /**
   * Create path for erasing
   * @override
   * @private
   * @param {Array} pathData
   * @returns {Path}
   */
  createPath(pathData) {
    const path = super.createPath(pathData);
    path.globalCompositeOperation = this.inverted
      ? "source-over"
      : "destination-out";
    path.stroke = this.inverted ? "white" : "black";
    path.strokeWidth = this.width;
    path.strokeLineCap = "round";
    path.strokeLineJoin = "round";
    path.fill = null;
    return path;
  }

  /**
   * Add eraser path to an object
   * @private
   * @param {FabricObject} obj
   * @param {Path} path
   */
  _addPathToObjectEraser(obj, path) {
    console.log("_addPathToObjectEraser called for:", obj.type);
    // For groups with deep erasable property
    if (obj.type === "group" && obj.erasable === "deep") {
      const targets = obj.getObjects().filter((_obj) => _obj.erasable);
      targets.forEach((_obj) => {
        this._addPathToObjectEraser(_obj, path);
      });
      return;
    }

    // Create or get existing eraser
    if (!obj.eraser) {
      console.log("Creating new eraser for object");
      obj.eraser = new Group([], {
        originX: "center",
        originY: "center",
        excludeFromExport: false,
      });
      // Mark as eraser type if available
      if (obj.eraser.set) {
        try {
          obj.eraser.type = "eraser";
        } catch (e) {
          console.log("Could not set eraser type:", e);
        }
      }
    } else {
      console.log(
        "Using existing eraser, paths count:",
        obj.eraser.getObjects ? obj.eraser.getObjects().length : 0
      );
    }

    // Clone and transform path to object's coordinate system
    console.log("Starting path clone process");

    // Try Promise-based clone for Fabric.js v6
    try {
      const cloneResult = path.clone();
      console.log("Clone result type:", typeof cloneResult);

      if (cloneResult && typeof cloneResult.then === "function") {
        console.log("Using Promise-based clone");
        cloneResult
          .then((clonedPath) => {
            console.log("Promise clone resolved, clonedPath:", clonedPath);
            this._processEraserPath(obj, clonedPath);
          })
          .catch((error) => {
            console.error("Promise clone failed:", error);
          });
        return; // Exit early for promise-based approach
      } else if (cloneResult) {
        console.log("Using synchronous clone result");
        this._processEraserPath(obj, cloneResult);
        return; // Exit early for sync approach
      }
    } catch (error) {
      console.log("Clone attempt failed, trying callback:", error);
    }

    // Fallback to callback pattern
    path.clone((clonedPath) => {
      console.log("Callback clone executed, clonedPath:", clonedPath);
      const objTransform = obj.calcTransformMatrix();
      const pathTransform = clonedPath.calcTransformMatrix();

      // Calculate the transform to move path from canvas coords to object coords
      const invertedObjTransform = util.invertTransform(objTransform);
      const desiredTransform = util.multiplyTransformMatrices(
        invertedObjTransform,
        pathTransform
      );

      util.applyTransformToObject(clonedPath, desiredTransform);

      // Add to eraser group
      console.log(
        "Adding cloned path to eraser group, clonedPath type:",
        clonedPath.type
      );
      console.log(
        "Eraser before add:",
        obj.eraser.getObjects().length,
        "paths"
      );

      const addResult = obj.eraser.add(clonedPath);
      console.log("Add result:", addResult);

      console.log("Eraser after add:", obj.eraser.getObjects().length, "paths");

      // Try alternative adding method if first doesn't work
      if (obj.eraser.getObjects().length === 0) {
        console.log("Add failed, trying addWithUpdate");
        obj.eraser.addWithUpdate(clonedPath);
        console.log(
          "Eraser after addWithUpdate:",
          obj.eraser.getObjects().length,
          "paths"
        );
      }

      obj.set("dirty", true);
      console.log("Object marked as dirty");

      obj.fire("erasing:end", {
        path: clonedPath,
      });

      console.log("Eraser application complete, requesting render");
    });
  }

  /**
   * Process the cloned eraser path and add it to the object's eraser
   * @private
   * @param {FabricObject} obj
   * @param {Path} clonedPath
   */
  _processEraserPath(obj, clonedPath) {
    console.log("Processing eraser path, clonedPath type:", clonedPath.type);

    const objTransform = obj.calcTransformMatrix();
    const pathTransform = clonedPath.calcTransformMatrix();

    // Calculate the transform to move path from canvas coords to object coords
    const invertedObjTransform = util.invertTransform(objTransform);
    const desiredTransform = util.multiplyTransformMatrices(
      invertedObjTransform,
      pathTransform
    );

    util.applyTransformToObject(clonedPath, desiredTransform);

    // Try a different approach: Use globalCompositeOperation on the object itself
    console.log("Trying alternative erasing approach - composite operation");

    try {
      // Instead of clipPath, let's try modifying the object's rendering behavior
      console.log("Setting up object for eraser composite operation");

      // Add eraser path to the eraser group for tracking
      const addResult = obj.eraser.add(clonedPath);
      console.log("Added eraser path to tracking group:", addResult);

      // Try approach 1: Set globalCompositeOperation on the eraser paths
      obj.eraser.forEachObject((eraserPath) => {
        eraserPath.globalCompositeOperation = "destination-out";
        console.log("Set eraser path composite operation to destination-out");
      });

      // Try approach 2: Use the eraser group as a mask, but without inverted
      obj.eraser.set({
        globalCompositeOperation: "destination-out",
        absolutePositioned: false,
      });

      // Set as clipPath but without inverted
      obj.set("clipPath", obj.eraser);
      console.log("Set eraser as clipPath with destination-out operation");
      console.log(
        "ClipPath composite operation:",
        obj.clipPath?.globalCompositeOperation
      );
      console.log("ClipPath objects:", obj.clipPath?.getObjects?.()?.length);

      obj.set("dirty", true);
      console.log("Object marked as dirty with composite eraser applied");

      obj.fire("erasing:end", {
        path: clonedPath,
      });

      console.log("Composite eraser application complete");
    } catch (error) {
      console.error("Composite eraser approach failed:", error);

      // Fallback: Try the old pixel-based approach
      console.log("Trying pixel-based erasing fallback");
      try {
        // Remove the object entirely and recreate it with erased parts
        // This is drastic but might work
        console.log("Attempting object removal and recreation");

        // For now, just add to eraser group
        const addResult = obj.eraser.add(clonedPath);
        console.log("Fallback: added to eraser group:", addResult);

        obj.set("dirty", true);
        obj.fire("erasing:end", {
          path: clonedPath,
        });
      } catch (fallbackError) {
        console.error("All erasing approaches failed:", fallbackError);
      }
    }
  }

  /**
   * Apply eraser to canvas background/overlay images
   * @private
   * @param {Path} path
   * @returns {Object}
   */
  applyEraserToCanvas(path) {
    const drawables = {};

    ["backgroundImage", "overlayImage"].forEach((prop) => {
      const drawable = this.canvas[prop];
      if (drawable && drawable.erasable) {
        this._addPathToObjectEraser(drawable, path);
        drawables[prop] = drawable;
      }
    });

    console.log("Drawables:", drawables);

    return drawables;
  }

  /**
   * Finalize the erasing path and apply to intersecting objects
   * @override
   * @private
   */
  _finalizeAndAddPath() {
    const ctx = this.canvas.contextTop;

    ctx.closePath();

    if (this.decimate) {
      this._points = this.decimatePoints(this._points, this.decimate);
    }

    // Clear top canvas
    this.canvas.clearContext(this.canvas.contextTop);
    this._isErasing = false;

    const pathData =
      this._points && this._points.length > 1
        ? this.convertPointsToSVGPath(this._points)
        : null;

    if (!pathData || this._isEmptySVGPath(pathData)) {
      this.canvas.fire("erasing:end");
      this.canvas.requestRenderAll();
      return;
    }

    const path = this.createPath(pathData);
    path.setCoords();

    this.canvas.fire("before:path:created", { path });

    // Apply erasing to canvas drawables
    const drawables = this.applyEraserToCanvas(path);

    // Apply erasing to intersecting objects
    const targets = [];
    console.log("Checking objects for erasing, path:", path);
    console.log("Canvas objects count:", this.canvas.getObjects().length);

    this.canvas.forEachObject((obj) => {
      console.log(
        "Checking object:",
        obj.type,
        "erasable:",
        this._isErasable(obj)
      );

      if (this._isErasable(obj)) {
        const intersects = obj.intersectsWithObject?.(path, true, true);
        console.log("Object intersects with path:", intersects);

        if (intersects) {
          console.log("Adding eraser to object:", obj.type);
          this._addPathToObjectEraser(obj, path);
          targets.push(obj);
        }
      }
    });

    console.log("Targets found:", targets.length);

    // Fire events
    this.canvas.fire("erasing:end", {
      path,
      targets,
      drawables,
    });

    this.canvas.requestRenderAll();
    this._resetShadow();

    // Debug: Check objects after render to see if clipPath persists
    setTimeout(() => {
      console.log("=== POST-RENDER CLIPPATH CHECK ===");
      this.canvas.forEachObject((obj) => {
        if (obj.clipPath) {
          console.log("Object still has clipPath:", {
            type: obj.type,
            clipPathInverted: obj.clipPath.inverted,
            clipPathObjects: obj.clipPath.getObjects
              ? obj.clipPath.getObjects().length
              : 0,
          });
        } else if (obj.eraser && obj.eraser.getObjects().length > 0) {
          console.log("Object has eraser but no clipPath:", {
            type: obj.type,
            eraserObjects: obj.eraser.getObjects().length,
          });
        }
      });
    }, 100);

    this.canvas.fire("path:created", { path });
  }

  /**
   * Decimate points to reduce path complexity
   * @param {Array} points
   * @param {number} distance
   * @returns {Array}
   */
  decimatePoints(points, distance) {
    if (!points || points.length <= 2) return points;

    const decimated = [points[0]];
    let lastPoint = points[0];

    for (let i = 1; i < points.length - 1; i++) {
      const point = points[i];
      const dist = Math.sqrt(
        Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2)
      );

      if (dist >= distance) {
        decimated.push(point);
        lastPoint = point;
      }
    }

    // Always include the last point
    decimated.push(points[points.length - 1]);
    return decimated;
  }

  /**
   * Convert points to SVG path
   * @param {Array} points
   * @returns {string}
   */
  convertPointsToSVGPath(points) {
    if (!points || points.length < 2) return "";

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  }

  /**
   * Check if SVG path is empty
   * @param {string} pathData
   * @returns {boolean}
   */
  _isEmptySVGPath(pathData) {
    return !pathData || pathData.trim().length === 0;
  }

  /**
   * Check if brush needs full render
   * @returns {boolean}
   */
  needsFullRender() {
    return true;
  }
}
