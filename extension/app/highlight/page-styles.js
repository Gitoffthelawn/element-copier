function buildGenericHighlightPageCss(classes) {
    return `
.${classes.highlightTarget} {
  cursor: crosshair !important;
}
iframe {
  pointer-events: none !important;
  cursor: crosshair !important;
}
iframe.${classes.highlightFill} {
  /* Approximate highlight fill over varied iframe content (not exact rgba). */
  filter: sepia(0.65) saturate(11) hue-rotate(342deg) brightness(0.88) !important;
}
`;
  }

function ensurePageHighlightStyles(config) {
  if (document.getElementById(config.styleId)) return;
  const style = document.createElement("style");
  style.id = config.styleId;
  style.textContent = config.pageCss;
  document.documentElement.appendChild(style);
}

function removePageHighlightStyles(styleId) {
  document.getElementById(styleId)?.remove();
}

export { buildGenericHighlightPageCss, ensurePageHighlightStyles, removePageHighlightStyles };
