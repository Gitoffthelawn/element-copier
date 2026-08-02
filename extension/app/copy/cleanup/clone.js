import { LIST_TAGS2, OMIT_TAGS } from "./constants.js";

function isDomLeafElement(element) {
  return element.childNodes.length === 0;
}

function cloneChildNodesForClipboard(parent) {
  const doc = parent.ownerDocument ?? document;
  const fragment = doc.createDocumentFragment();
  for (const child of parent.childNodes) {
    fragment.appendChild(cloneNodeForClipboard(child));
  }
  return fragment;
}

function cloneNodeForClipboard(node) {
  if (!(node instanceof Element)) {
    return node.cloneNode(true);
  }
  if (OMIT_TAGS.has(node.tagName)) {
    return node.ownerDocument.createDocumentFragment();
  }
  if (node.shadowRoot) {
    const clone2 = node.cloneNode(false);
    clone2.appendChild(cloneChildNodesForClipboard(node));
    clone2.appendChild(cloneChildNodesForClipboard(node.shadowRoot));
    return clone2;
  }
  const clone = node.cloneNode(false);
  for (const child of node.childNodes) {
    clone.appendChild(cloneNodeForClipboard(child));
  }
  return clone;
}

function cloneShadowAwareContents(element) {
  const doc = element.ownerDocument;
  const fragment = doc.createDocumentFragment();
  fragment.appendChild(cloneChildNodesForClipboard(element));
  fragment.appendChild(cloneChildNodesForClipboard(element.shadowRoot));
  return fragment;
}

function cloneElementForClipboard(element) {
  if (element.tagName === "TABLE" || LIST_TAGS2.has(element.tagName)) {
    return cloneNodeForClipboard(element);
  }
  if (element.shadowRoot) {
    return cloneShadowAwareContents(element);
  }
  if (isDomLeafElement(element) && !OMIT_TAGS.has(element.tagName)) {
    return cloneNodeForClipboard(element);
  }
  return cloneChildNodesForClipboard(element);
}

export { cloneChildNodesForClipboard, cloneElementForClipboard, cloneNodeForClipboard, cloneShadowAwareContents, isDomLeafElement };
