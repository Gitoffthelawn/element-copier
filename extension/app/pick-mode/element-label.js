import { getCssSelector } from "../copy/selector.js";
import { getFullXPath } from "../copy/xpath.js";

function formatTagIdClassLabel(el) {
  const tag = el.tagName.toLowerCase();
  const id = el.id.trim();
  if (id) return `${tag}#${id}`;
  const classes = Array.from(el.classList).map((c) => c.trim()).filter(Boolean);
  if (classes.length > 0) {
    return `${tag}.${classes.slice(0, 3).join(".")}`;
  }
  return tag;
}

function formatFrameElementLabel(el, style, clickToCopyLabel) {
  switch (style) {
    case "none":
      return "";
    case "click-to-copy":
      return clickToCopyLabel;
    case "tag-id-class":
      return formatTagIdClassLabel(el);
    case "selector":
      return getCssSelector(el);
    case "full-xpath":
      return getFullXPath(el);
  }
}

export { formatFrameElementLabel, formatTagIdClassLabel };
