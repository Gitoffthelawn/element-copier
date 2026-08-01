var INHERITABLE_PROPERTIES = new Set([
  "azimuth",
  "border-collapse",
  "border-spacing",
  "caption-side",
  "color",
  "cursor",
  "direction",
  "elevation",
  "empty-cells",
  "font",
  "font-family",
  "font-size",
  "font-style",
  "font-variant",
  "font-weight",
  "letter-spacing",
  "line-height",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "orphans",
  "quotes",
  "tab-size",
  "text-align",
  "text-indent",
  "text-size-adjust",
  "text-transform",
  "visibility",
  "white-space",
  "widows",
  "word-spacing",
  "writing-mode",
  "-webkit-font-smoothing",
  "-webkit-text-size-adjust"
]);

function isInheritableProperty(name) {
  return name.startsWith("--") || INHERITABLE_PROPERTIES.has(name);
}

function getAncestorsRootFirst(element) {
  const ancestors = [];
  let parent = element.parentElement;
  while (parent) {
    ancestors.unshift(parent);
    parent = parent.parentElement;
  }
  return ancestors;
}

function collectStylesheetContext(element) {
  const sheets = [];
  const seen = new Set();
  const adopted = new Set();
  const addSheet = (sheet) => {
    if (!sheet || seen.has(sheet)) return;
    seen.add(sheet);
    sheets.push(sheet);
  };
  const addAdoptedFromRoot = (root) => {
    // Indexed access avoids Firefox bug 1770592 for adoptedStyleSheets.
    let adoptedSheets;
    try {
      adoptedSheets = root.adoptedStyleSheets;
    } catch {
      return;
    }
    if (!adoptedSheets) return;
    try {
      for (let i = 0; i < adoptedSheets.length; i += 1) {
        const sheet = adoptedSheets[i] ?? null;
        if (sheet) adopted.add(sheet);
        addSheet(sheet);
      }
    } catch {
      // Skip adopted sheets when the host exposes a non-usable list.
    }
  };
  const doc = element.ownerDocument;
  for (let i = 0; i < doc.styleSheets.length; i += 1) {
    addSheet(doc.styleSheets[i] ?? null);
  }
  addAdoptedFromRoot(doc);
  let node = element;
  while (node) {
    if (node instanceof ShadowRoot) {
      addAdoptedFromRoot(node);
      const styleElements = node.querySelectorAll("style");
      for (let j = 0; j < styleElements.length; j += 1) {
        addSheet(styleElements[j]?.sheet ?? null);
      }
    }
    node = node.parentNode;
  }
  return { sheets, adopted };
}

function isAuthorStylesheet(sheet, adopted) {
  return adopted.has(sheet) || Boolean(sheet.ownerNode) || Boolean(sheet.href);
}

export { INHERITABLE_PROPERTIES, collectStylesheetContext, getAncestorsRootFirst, isAuthorStylesheet, isInheritableProperty };
