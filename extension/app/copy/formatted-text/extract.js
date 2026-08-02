import { enhanceClipboardTables } from "./tables.js";
import { enhanceInlineLists } from "./lists.js";
import { getElementAccessiblePlain } from "./accessible-text.js";
import { wrapClipboardHtml } from "./html-wrap.js";

function buildPlainTextClipboardHtml(doc, plain) {
  const wrapper = doc.createElement("div");
  wrapper.style.whiteSpace = "pre-wrap";
  wrapper.textContent = plain;
  return wrapClipboardHtml(wrapper.outerHTML);
}

function extractHtmlFromPreparedContainer(element, container) {
  enhanceInlineLists(element, container);
  enhanceClipboardTables(container);
  return wrapClipboardHtml(container.innerHTML.trim());
}

function finalizeFormattedHtml(element, html) {
  const resultHtml = html.trim();
  if (resultHtml) return resultHtml;
  const plain = getElementAccessiblePlain(element);
  if (!plain) return "";
  return buildPlainTextClipboardHtml(element.ownerDocument, plain);
}

export { buildPlainTextClipboardHtml, extractHtmlFromPreparedContainer, finalizeFormattedHtml };
