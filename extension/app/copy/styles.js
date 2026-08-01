import {
  collectStylesheetContext,
  getAncestorsRootFirst,
  isInheritableProperty
} from "./styles-context.js";
import { collectInlineStyles, collectMatchingRules } from "./styles-rules.js";
import { collapseShorthands, formatValue, setCascadeProperty } from "./styles-cascade.js";

function getElementStyles(element) {
  const context = collectStylesheetContext(element);
  let order = 0;
  const inherited = new Map();
  for (const ancestor of getAncestorsRootFirst(element)) {
    order = collectMatchingRules(ancestor, context, inherited, order, isInheritableProperty);
  }
  const own = new Map();
  order = collectMatchingRules(element, context, own, order, () => true);
  collectInlineStyles(element, own, order);
  const merged = new Map(inherited);
  for (const [name, entry] of own) setCascadeProperty(merged, name, entry);
  const output = new Map();
  for (const [name, entry] of merged) output.set(name, formatValue(entry));
  collapseShorthands(output);
  return Array.from(output.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([prop, value]) => `${prop}: ${value};`)
    .join("\n");
}

export { getElementStyles };
export * from "./styles-context.js";
export * from "./styles-rules.js";
export * from "./styles-cascade.js";
