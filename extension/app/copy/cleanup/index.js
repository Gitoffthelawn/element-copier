import { absolutizeClipboardLinks, normalizeClipboardLinks } from "./links.js";
import { applyInlineImagePolicy, shouldMaterializeInlineDataUrl } from "./inline-images.js";
import { cloneElementForClipboard } from "./clone.js";
import { materializeVisualsInContainer } from "./materialize-visuals.js";
import { normalizeClipboardWhitespace } from "./whitespace.js";
import { pruneHiddenEmptyTableRows, removeNoscriptAndComments, sanitizeClipboardHtml } from "./sanitize.js";

async function prepareElementForCopy(element, options) {
  const doc = element.ownerDocument;
  const container = doc.createElement("div");
  container.appendChild(cloneElementForClipboard(element));
  removeNoscriptAndComments(container);
  const inlineImages = options?.inlineImages ?? "all";
  applyInlineImagePolicy(container, inlineImages);
  await materializeVisualsInContainer(element, container, {
    ...inlineImages === "all" ? {} : { shouldMaterializeInlineSrc: (src) => shouldMaterializeInlineDataUrl(src, inlineImages) }
  });
  sanitizeClipboardHtml(container);
  applyInlineImagePolicy(container, inlineImages);
  normalizeClipboardWhitespace(container);
  if (options?.baseHref) {
    absolutizeClipboardLinks(container, options.baseHref);
  }
  normalizeClipboardLinks(container, options?.baseHref);
  if (options?.pruneHiddenTableRows) {
    pruneHiddenEmptyTableRows(container);
  }
  return container;
}

export { prepareElementForCopy };
