var STABLE_ATTRS = [
  "data-testid",
  "data-test",
  "data-cy",
  "data-qa",
  "name",
  "aria-label"
];

function escapeCssIdent(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/([^\w-])/g, "\\$1");
}

function escapeCssAttrValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function nthChild(element) {
  const parent = element.parentElement;
  if (!parent) return 1;
  return Array.prototype.indexOf.call(parent.children, element) + 1;
}

function siblingDisambiguation(element) {
  const parent = element.parentElement;
  if (!parent) return { needsClassNames: false, needsNthChild: false };
  const tag = element.tagName;
  const ownClasses = Array.from(element.classList);
  const sameTagSiblings = Array.from(parent.children).filter(
    (sibling) => sibling !== element && sibling.tagName === tag
  );
  return {
    needsClassNames: sameTagSiblings.length > 0,
    needsNthChild: sameTagSiblings.some(
      (sibling) => ownClasses.length === 0 || ownClasses.every((cls) => sibling.classList.contains(cls))
    )
  };
}

function preferredAttribute(element) {
  for (const name of STABLE_ATTRS) {
    const value = element.getAttribute(name);
    if (value) return { name, value };
  }
  return null;
}

function matchesOnly(selector, element, doc = element.ownerDocument) {
  try {
    const found = doc.querySelectorAll(selector);
    return found.length === 1 && found[0] === element;
  } catch {
    return false;
  }
}

function buildCssSegment(element) {
  if (element.id) {
    return `#${escapeCssIdent(element.id)}`;
  }
  const tag = element.tagName.toLowerCase();
  const attr = preferredAttribute(element);
  if (attr) {
    return `${tag}[${attr.name}="${escapeCssAttrValue(attr.value)}"]`;
  }
  const { needsClassNames, needsNthChild } = siblingDisambiguation(element);
  if (needsNthChild) {
    return `${tag}:nth-child(${nthChild(element)})`;
  }
  if (needsClassNames && element.classList.length > 0) {
    const classPart = Array.from(element.classList).map((name) => `.${escapeCssIdent(name)}`).join("");
    return `${tag}${classPart}`;
  }
  return tag;
}

function getCssSelector(element) {
  const doc = element.ownerDocument;
  if (element.id) {
    const byId = `#${escapeCssIdent(element.id)}`;
    if (matchesOnly(byId, element, doc)) return byId;
  }
  const parts = [];
  let node = element;
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    parts.unshift(buildCssSegment(node));
    const candidate = parts.join(" > ");
    const hasIdAnchor = parts.some((part) => part.startsWith("#"));
    if (matchesOnly(candidate, element, doc) && (hasIdAnchor || !node.parentElement)) {
      return candidate;
    }
    node = node.parentElement;
  }
  return parts.join(" > ");
}

export { STABLE_ATTRS, buildCssSegment, escapeCssAttrValue, escapeCssIdent, getCssSelector, matchesOnly, nthChild, preferredAttribute, siblingDisambiguation };
