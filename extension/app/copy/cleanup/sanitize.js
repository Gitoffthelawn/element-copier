import { OMIT_TAGS } from "./constants.js";

function isDerivativeFormatNoiseNode(node) {
  if (node.nodeType === Node.COMMENT_NODE) return true;
  return node instanceof Element && node.tagName === "NOSCRIPT";
}

function removeNoscriptAndComments(root2) {
  const ownerDocument = root2.ownerDocument;
  if (!ownerDocument) return;
  const walker = ownerDocument.createTreeWalker(
    root2,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT
  );
  const toRemove = [];
  let node = walker.nextNode();
  while (node) {
    if (isDerivativeFormatNoiseNode(node)) {
      toRemove.push(node);
    }
    node = walker.nextNode();
  }
  for (const node2 of toRemove) {
    node2.parentNode?.removeChild(node2);
  }
}

function sanitizeClipboardHtml(root2) {
  const doc = root2.ownerDocument;
  const walker = doc.createTreeWalker(root2, NodeFilter.SHOW_ELEMENT);
  const toRemove = [];
  let node = walker.currentNode;
  while (node) {
    if (OMIT_TAGS.has(node.tagName) || node.tagName === "SVG") {
      toRemove.push(node);
    } else {
      for (const attr of [...node.attributes]) {
        const name = attr.name.toLowerCase();
        if (name.startsWith("on") || name === "contenteditable") {
          node.removeAttribute(attr.name);
        }
      }
    }
    node = walker.nextNode();
  }
  for (const el of toRemove) {
    el.remove();
  }
}

function pruneHiddenEmptyTableRows(root2) {
  for (const row of root2.querySelectorAll("tr")) {
    const style = row.getAttribute("style") ?? "";
    if (!/display\s*:\s*none/i.test(style)) continue;
    if ((row.textContent ?? "").trim()) continue;
    row.remove();
  }
}

export { isDerivativeFormatNoiseNode, pruneHiddenEmptyTableRows, removeNoscriptAndComments, sanitizeClipboardHtml };
