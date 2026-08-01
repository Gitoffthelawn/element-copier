var PRESERVE_WHITESPACE_TAGS = /* @__PURE__ */ new Set(["PRE", "CODE", "TEXTAREA"]);

function isInsidePreserveWhitespaceElement(node) {
  let el = node.parentElement;
  while (el) {
    if (PRESERVE_WHITESPACE_TAGS.has(el.tagName)) return true;
    el = el.parentElement;
  }
  return false;
}

function normalizeClipboardWhitespace(root2) {
  const walker = root2.ownerDocument.createTreeWalker(root2, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const text = node;
    if (!isInsidePreserveWhitespaceElement(text) && text.nodeValue) {
      text.nodeValue = text.nodeValue.replace(/\s+/g, " ");
    }
    node = walker.nextNode();
  }
}

export { PRESERVE_WHITESPACE_TAGS, isInsidePreserveWhitespaceElement, normalizeClipboardWhitespace };
