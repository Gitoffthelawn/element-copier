import { getCssSelector } from "./selector.js";

function escapeJsString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function matchesOnly2(selector, element, doc = element.ownerDocument) {
  try {
    const found = doc.querySelectorAll(selector);
    return found.length === 1 && found[0] === element;
  } catch {
    return false;
  }
}

function getJsPath(element) {
  const selector = getCssSelector(element);
  if (matchesOnly2(selector, element)) {
    return `document.querySelector("${escapeJsString(selector)}")`;
  }
  return getJsPathByIndex(element);
}

function getJsPathByIndex(element) {
  const doc = element.ownerDocument;
  if (element === doc.documentElement) return "document.documentElement";
  if (element === doc.body) return "document.body";
  const segments = [];
  let node = element;
  while (node && node !== doc.body && node !== doc.documentElement) {
    const parent = node.parentElement;
    if (!parent) break;
    const index = Array.prototype.indexOf.call(parent.children, node);
    segments.unshift(`children[${index}]`);
    node = parent;
  }
  if (node === doc.body) {
    return segments.length > 0 ? `document.body.${segments.join(".")}` : "document.body";
  }
  return segments.length > 0 ? `document.documentElement.${segments.join(".")}` : "document.documentElement";
}

export { escapeJsString, getJsPath, getJsPathByIndex, matchesOnly2 };
