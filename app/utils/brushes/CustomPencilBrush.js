import { PencilBrush } from "fabric";

/**
 * Custom PencilBrush class for enhanced drawing
 * Extends the default Fabric.js PencilBrush with custom styling
 */
export class CustomPencilBrush extends PencilBrush {
  constructor(canvas) {
    super(canvas);

    this.type = "pencil";
    this.width = 3;
    this.color = "#ef4444";
    this.strokeLineCap = "round";
    this.strokeLineJoin = "round";
    this.shadow = null;
  }

  /**
   * Set brush styles
   * @private
   * @param {CanvasRenderingContext2D} ctx
   */
  _setBrushStyles(ctx) {
    super._setBrushStyles(ctx);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = this.strokeLineCap;
    ctx.lineJoin = this.strokeLineJoin;
    ctx.globalAlpha = 1;
  }

  /**
   * Create path with custom styling
   * @override
   * @param {Array} pathData
   * @returns {Path}
   */
  createPath(pathData) {
    const path = super.createPath(pathData);

    // Apply custom styling to the created path
    path.stroke = this.color;
    path.strokeWidth = this.width;
    path.strokeLineCap = this.strokeLineCap;
    path.strokeLineJoin = this.strokeLineJoin;
    path.fill = null;

    // Apply shadow if set
    if (this.shadow) {
      path.shadow = this.shadow;
    }

    return path;
  }

  /**
   * Update brush properties
   * @param {Object} options
   */
  updateOptions(options = {}) {
    if (options.color !== undefined) this.color = options.color;
    if (options.width !== undefined) this.width = options.width;
    if (options.strokeLineCap !== undefined)
      this.strokeLineCap = options.strokeLineCap;
    if (options.strokeLineJoin !== undefined)
      this.strokeLineJoin = options.strokeLineJoin;
    if (options.shadow !== undefined) this.shadow = options.shadow;
  }
}
