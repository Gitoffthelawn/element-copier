var LARGE_INLINE_DATA_URL_CHARS = 2048;

function shouldMaterializeInlineDataUrl(value, mode) {
  if (mode === "all" || !value.includes("data:")) return true;
  if (mode === "remove-all") return false;
  if (mode === "remove-large") return value.length <= LARGE_INLINE_DATA_URL_CHARS;
  return value.length > LARGE_INLINE_DATA_URL_CHARS;
}

var INLINE_DATA_URL_ATTRS = ["src", "href", "poster", "srcset"];

function applyInlineImagePolicy(root2, mode) {
  if (mode === "all") return;
  for (const el of root2.querySelectorAll("[src], [href], [poster], [srcset]")) {
    for (const attr of INLINE_DATA_URL_ATTRS) {
      const value = el.getAttribute(attr);
      if (!value?.includes("data:")) continue;
      if (!shouldMaterializeInlineDataUrl(value, mode)) {
        el.removeAttribute(attr);
      }
    }
  }
}

export { INLINE_DATA_URL_ATTRS, LARGE_INLINE_DATA_URL_CHARS, applyInlineImagePolicy, shouldMaterializeInlineDataUrl };
