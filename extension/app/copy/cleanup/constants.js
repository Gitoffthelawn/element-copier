var OMIT_TAGS = /* @__PURE__ */ new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEMPLATE",
  "OBJECT",
  "EMBED",
  "IFRAME",
  "CANVAS",
  "LINK",
  "META",
  "BASE"
]);

var LIST_TAGS2 = /* @__PURE__ */ new Set(["UL", "OL"]);

export { LIST_TAGS2, OMIT_TAGS };
