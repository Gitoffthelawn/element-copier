function applyStyleDeclarations(style, properties, context) {
  for (let i = 0; i < style.length; i += 1) {
    const name = style.item(i);
    if (!name || !context.includeProperty(name)) continue;
    const value = style.getPropertyValue(name);
    if (!value) continue;
    setCascadeProperty(properties, name, {
      value,
      important: style.getPropertyPriority(name) === "important",
      specificity: context.specificity,
      order: context.order,
      isInline: context.isInline
    });
  }
}

function setCascadeProperty(properties, name, next) {
  const current = properties.get(name);
  if (!current || cascadeEntryWins(next, current)) properties.set(name, next);
}

function cascadeEntryWins(next, current) {
  if (next.important !== current.important) return next.important;
  if (next.isInline !== current.isInline) return next.isInline;
  if (next.specificity !== current.specificity) return next.specificity > current.specificity;
  return next.order >= current.order;
}

function formatValue(entry) {
  return entry.important ? `${entry.value} !important` : entry.value;
}

function collapseShorthands(properties) {
  collapseBoxShorthand(properties, "padding");
  collapseBoxShorthand(properties, "margin");
  collapseOverflow(properties);
  collapseWhiteSpace(properties);
}

function collapseBoxShorthand(properties, prefix) {
  if (properties.has(prefix)) return;
  const top = properties.get(`${prefix}-top`);
  const right = properties.get(`${prefix}-right`);
  const bottom = properties.get(`${prefix}-bottom`);
  const left = properties.get(`${prefix}-left`);
  if (top === void 0 || right === void 0 || bottom === void 0 || left === void 0) return;
  let shorthand;
  if (top === right && right === bottom && bottom === left) {
    shorthand = top;
  } else if (top === bottom && right === left) {
    shorthand = `${top} ${right}`;
  } else if (right === left) {
    shorthand = `${top} ${right} ${bottom}`;
  } else {
    shorthand = `${top} ${right} ${bottom} ${left}`;
  }
  properties.delete(`${prefix}-top`);
  properties.delete(`${prefix}-right`);
  properties.delete(`${prefix}-bottom`);
  properties.delete(`${prefix}-left`);
  properties.set(prefix, shorthand);
}

function collapseOverflow(properties) {
  if (properties.has("overflow")) return;
  const x = properties.get("overflow-x");
  const y = properties.get("overflow-y");
  if (x === void 0 || y === void 0) return;
  properties.delete("overflow-x");
  properties.delete("overflow-y");
  properties.set("overflow", x === y ? x : `${x} ${y}`);
}

var WHITE_SPACE_LONGHANDS = {
  "collapse|nowrap": "nowrap",
  "collapse|wrap": "normal",
  "preserve|wrap": "pre-wrap",
  "preserve|nowrap": "pre",
  "preserve-breaks|wrap": "pre-line",
  "collapse|balance": "balance"
};

function collapseWhiteSpace(properties) {
  if (properties.has("white-space")) return;
  const collapse = properties.get("white-space-collapse");
  const wrap = properties.get("text-wrap-mode");
  if (!collapse || !wrap) return;
  const shorthand = WHITE_SPACE_LONGHANDS[`${collapse}|${wrap}`];
  if (!shorthand) return;
  properties.delete("white-space-collapse");
  properties.delete("text-wrap-mode");
  properties.set("white-space", shorthand);
}

export { WHITE_SPACE_LONGHANDS, applyStyleDeclarations, cascadeEntryWins, collapseBoxShorthand, collapseOverflow, collapseShorthands, collapseWhiteSpace, formatValue, setCascadeProperty };
