import { Point, util } from "fabric";

/**
 * Fabric.js utility extensions
 * These are essential for advanced brush functionality
 */

// Extend Point prototype with angle calculation
Point.prototype.angleBetween = function (that) {
  return Math.atan2(this.x - that.x, this.y - that.y);
};

// Extend Point prototype with normalization
Point.prototype.normalize = function (thickness) {
  if (null === thickness || undefined === thickness) {
    thickness = 1;
  }

  var length = this.distanceFrom({ x: 0, y: 0 });

  if (length > 0) {
    this.x = (this.x / length) * thickness;
    this.y = (this.y / length) * thickness;
  }

  return this;
};

// Create our own utility functions since Fabric.js util is not extensible
const fabricUtilExtensions = {
  getRandom: function (max, min) {
    min = min ? min : 0;
    return Math.random() * ((max ? max : 1) - min) + min;
  },

  clamp: function (n, max, min) {
    if (typeof min !== "number") min = 0;
    return n > max ? max : n < min ? min : n;
  },

  rotateAndPaintImage: function (
    context,
    image,
    angleInRad,
    positionX,
    positionY,
    axisX,
    axisY
  ) {
    context.canvas.contextTop.save();
    context.canvas.contextTop.translate(
      positionX + axisX / 2,
      positionY + axisY / 2
    );
    context.canvas.contextTop.rotate(angleInRad);
    context.canvas.contextTop.translate(
      -positionX + axisX / 2,
      -positionY + axisY / 2
    );
    context.canvas.contextTop.drawImage(
      image,
      positionX,
      positionY,
      -axisX,
      -axisY
    );
    context.canvas.contextTop.restore();
  },
};

// Try to extend util safely, fall back to global if not possible
try {
  Object.assign(util, fabricUtilExtensions);
} catch (error) {
  console.warn("Could not extend fabric util, adding to global scope:", error);
  // Make utilities available globally for the brushes
  if (typeof window !== "undefined") {
    window.fabricUtilExtensions = fabricUtilExtensions;
  }
}

// Extensions are applied to the imported objects directly
// Also export utilities for direct use
console.log("Fabric.js utilities loaded");

export { fabricUtilExtensions };
