import { domToCanvas } from "../../vendor/modern-screenshot.js";
import { isDerivativeFormatNoiseNode } from "../copy/cleanup/sanitize.js";

var IMAGE_FORMATS = /* @__PURE__ */ new Set(["png", "jpeg"]);

var TRANSPARENT_CANVAS_FALLBACK = "rgba(0, 0, 0, 0)";

var FETCH_PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function cssAlphaIsZero(alpha) {
  const value = alpha.trim();
  if (value.endsWith("%")) {
    return Number.parseFloat(value) === 0;
  }
  return Number.parseFloat(value) === 0;
}

function isTransparentBackground(color) {
  const normalized = color.trim().toLowerCase();
  if (!normalized || normalized === "transparent") return true;
  const slashAlpha = normalized.match(/\/\s*([^)]+)\)$/);
  if (slashAlpha) {
    return cssAlphaIsZero(slashAlpha[1]);
  }
  const rgbaAlpha = normalized.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([^)]+)\)$/);
  return rgbaAlpha ? cssAlphaIsZero(rgbaAlpha[1]) : false;
}

function isEmptyBackgroundImage(backgroundImage) {
  const normalized = backgroundImage.trim().toLowerCase();
  return !normalized || normalized === "none";
}

function getComputedStyleSnapshotProperty(computedStyles, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|\\n)${escaped}:\\s*([^;]+);`, "i").exec(computedStyles);
  return match?.[1]?.trim() ?? "";
}

function getBackgroundFromComputedStyleSnapshot(computedStyles) {
  if (!computedStyles) return null;
  const backgroundColor = getComputedStyleSnapshotProperty(
    computedStyles,
    "background-color"
  );
  const backgroundImage = getComputedStyleSnapshotProperty(
    computedStyles,
    "background-image"
  );
  const background = getComputedStyleSnapshotProperty(computedStyles, "background");
  const color = isTransparentBackground(backgroundColor) ? null : backgroundColor;
  const visibleBackgroundImage = isEmptyBackgroundImage(backgroundImage) ? null : backgroundImage;
  const visibleBackground = visibleBackgroundImage ? background || null : null;
  if (!color && !visibleBackground && !visibleBackgroundImage) return null;
  return { color, background: visibleBackground, backgroundImage: visibleBackgroundImage };
}

function getParentElement(element) {
  if (element.parentElement) return element.parentElement;
  const root2 = element.getRootNode();
  return root2 instanceof ShadowRoot ? root2.host : null;
}

function getElementBackground(element) {
  const view = element.ownerDocument.defaultView;
  if (!view) return null;
  const styles = view.getComputedStyle(element);
  const color = isTransparentBackground(styles.backgroundColor) ? null : styles.backgroundColor;
  const background = isEmptyBackgroundImage(styles.backgroundImage) ? null : styles.background;
  const backgroundImage = isEmptyBackgroundImage(styles.backgroundImage) ? null : styles.backgroundImage;
  if (!color && !background && !backgroundImage) return null;
  return { color, background, backgroundImage };
}

function createScreenshotBackgroundSnapshot(element, computedStylesSnapshot) {
  const backgrounds = [];
  const targetBackground = getBackgroundFromComputedStyleSnapshot(computedStylesSnapshot);
  if (targetBackground) {
    backgrounds.push(targetBackground);
  }
  let current = element;
  while (current) {
    const background = getElementBackground(current);
    if (background) backgrounds.push(background);
    current = getParentElement(current);
  }
  const { body, documentElement } = element.ownerDocument;
  for (const fallbackElement of [body, documentElement]) {
    if (!fallbackElement) continue;
    const background = getElementBackground(fallbackElement);
    if (background) backgrounds.push(background);
  }
  return backgrounds;
}

function getEffectiveBackground(element, backgroundSnapshot) {
  for (const background of backgroundSnapshot ?? []) {
    if (background.color || background.background || background.backgroundImage) {
      return background;
    }
  }
  let current = element;
  while (current) {
    const background = getElementBackground(current);
    if (background) return background;
    current = getParentElement(current);
  }
  const { body, documentElement } = element.ownerDocument;
  for (const fallbackElement of [body, documentElement]) {
    if (!fallbackElement) continue;
    const background = getElementBackground(fallbackElement);
    if (background) return background;
  }
  return { color: null, background: null, backgroundImage: null };
}

function resolveJpegCompositeFillColor(backgroundSnapshot) {
  for (const background of backgroundSnapshot ?? []) {
    if (background.color) return background.color;
    if (background.background || background.backgroundImage) {
      return null;
    }
  }
  return "#ffffff";
}

function getRenderOptions(element, backgroundSnapshot) {
  const background = getEffectiveBackground(element, backgroundSnapshot);
  const style = {};
  if (background.background) {
    style.background = background.background;
  }
  if (background.backgroundImage) {
    style.backgroundImage = background.backgroundImage;
  }
  if (background.background || background.backgroundImage) {
    style.backgroundColor = background.color ?? TRANSPARENT_CANVAS_FALLBACK;
  }
  return {
    backgroundColor: background.color,
    fetch: {
      requestInit: { cache: "force-cache" },
      placeholderImage: FETCH_PLACEHOLDER_IMAGE
    },
    filter: (node) => !isDerivativeFormatNoiseNode(node),
    style: Object.keys(style).length > 0 ? style : null
  };
}

function isImageCopyFormat(formatId) {
  return IMAGE_FORMATS.has(formatId);
}

function createCanvasFromSource(source) {
  const doc = source.ownerDocument;
  const canvas = doc.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  return canvas;
}

function encodePng(canvas) {
  return canvas.toDataURL("image/png");
}

function encodeJpeg(renderedCanvas, backgroundSnapshot) {
  const jpegCanvas = createCanvasFromSource(renderedCanvas);
  const context = jpegCanvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to get 2d context for JPEG composition");
  }
  const fillColor = resolveJpegCompositeFillColor(backgroundSnapshot);
  if (fillColor) {
    context.fillStyle = fillColor;
    context.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
  }
  context.drawImage(renderedCanvas, 0, 0);
  return jpegCanvas.toDataURL("image/jpeg", 0.92);
}

async function captureElementImages(element, formats, backgroundSnapshot) {
  const requested = new Set(formats);
  if (requested.size === 0) return {};
  const renderedCanvas = await domToCanvas(
    element,
    getRenderOptions(element, backgroundSnapshot)
  );
  const result = {};
  if (requested.has("png")) {
    result.png = encodePng(renderedCanvas);
  }
  if (requested.has("jpeg")) {
    result.jpeg = encodeJpeg(renderedCanvas, backgroundSnapshot);
  }
  return result;
}

export { FETCH_PLACEHOLDER_IMAGE, IMAGE_FORMATS, TRANSPARENT_CANVAS_FALLBACK, captureElementImages, createCanvasFromSource, createScreenshotBackgroundSnapshot, cssAlphaIsZero, encodeJpeg, encodePng, getBackgroundFromComputedStyleSnapshot, getComputedStyleSnapshotProperty, getEffectiveBackground, getElementBackground, getParentElement, getRenderOptions, isEmptyBackgroundImage, isImageCopyFormat, isTransparentBackground, resolveJpegCompositeFillColor };
