var MIN_IFRAME_PICK_PX = 4;

function isPointInElement(el, x, y) {
  const rect = el.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function listIframesWithin(root2, isOurNode) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const scan = (node) => {
    for (const el of Array.from(node.querySelectorAll("iframe"))) {
      if (el instanceof HTMLIFrameElement && !seen.has(el) && !isOurNode(el)) {
        seen.add(el);
        out.push(el);
      }
    }
    for (const el of Array.from(node.querySelectorAll("*"))) {
      if (el instanceof Element && el.shadowRoot) {
        scan(el.shadowRoot);
      }
    }
  };
  scan(root2);
  return out;
}

function isIframeHitTestable(iframe) {
  if (iframe.hasAttribute("hidden")) return false;
  const style = getComputedStyle(iframe);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (parseFloat(style.opacity) <= 0) return false;
  const rect = iframe.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isSignificantIframe(iframe) {
  const rect = iframe.getBoundingClientRect();
  return rect.width >= MIN_IFRAME_PICK_PX && rect.height >= MIN_IFRAME_PICK_PX;
}

function iframeContainsPoint(iframe, x, y) {
  const rect = iframe.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function findIframeAtPoint(x, y, options) {
  let best = null;
  let bestArea = Infinity;
  for (const node of listIframesWithin(document, options.isOurNode)) {
    if (!isIframeHitTestable(node) || !isSignificantIframe(node) || !iframeContainsPoint(node, x, y)) {
      continue;
    }
    const rect = node.getBoundingClientRect();
    const area = rect.width * rect.height;
    if (area < bestArea) {
      bestArea = area;
      best = node;
    }
  }
  return best;
}

function pickElementUnderCursor(x, y, options) {
  const iframe = findIframeAtPoint(x, y, options);
  if (iframe) return iframe;
  const stack = document.elementsFromPoint(x, y);
  for (const node of stack) {
    if (!(node instanceof Element)) continue;
    if (options.isOurNode(node)) continue;
    if (node === document.documentElement || node === document.body) continue;
    return node;
  }
  return null;
}

export { MIN_IFRAME_PICK_PX, findIframeAtPoint, iframeContainsPoint, isIframeHitTestable, isPointInElement, isSignificantIframe, listIframesWithin, pickElementUnderCursor };
