import { isAuthorStylesheet } from "./styles-context.js";
import { applyStyleDeclarations, setCascadeProperty } from "./styles-cascade.js";

function collectMatchingRules(target, context, properties, order, includeProperty) {
  for (const sheet of context.sheets) {
    if (!isAuthorStylesheet(sheet, context.adopted)) continue;
    order = walkStylesheetRules(sheet, target, (rule, ruleOrder) => {
      const matchedSelector = findMatchingSelector(target, rule.selectorText);
      if (!matchedSelector) return;
      applyStyleDeclarations(rule.style, properties, {
        specificity: calculateSpecificity(matchedSelector),
        order: ruleOrder,
        isInline: false,
        includeProperty
      });
    }, order);
  }
  return order;
}

function collectInlineStyles(element, properties, order) {
  if (!(element instanceof HTMLElement)) return;
  const inline = element.style;
  for (let i = 0; i < inline.length; i += 1) {
    const name = inline.item(i);
    if (!name) continue;
    const value = inline.getPropertyValue(name);
    if (!value) continue;
    setCascadeProperty(properties, name, {
      value,
      important: inline.getPropertyPriority(name) === "important",
      specificity: 0,
      order,
      isInline: true
    });
    order += 1;
  }
}

function walkStylesheetRules(sheet, element, onStyleRule, order) {
  let rules;
  try {
    rules = sheet.cssRules;
  } catch {
    return order;
  }
  for (let i = 0; i < rules.length; i += 1) {
    order = walkRule(rules[i], element, onStyleRule, order, true);
  }
  return order;
}

function isMediaRule(rule) {
  return rule.type === CSSRule.MEDIA_RULE;
}

function isSupportsRule(rule) {
  return rule.type === CSSRule.SUPPORTS_RULE;
}

function isContainerRule(rule) {
  if (typeof CSSContainerRule !== "undefined" && rule instanceof CSSContainerRule) return true;
  return rule.constructor.name === "CSSContainerRule";
}

function doesMediaMatch(rule, element) {
  const view = element.ownerDocument.defaultView;
  if (!view) return false;
  if (typeof rule.matches === "boolean") return rule.matches;
  const mediaText = rule.media?.mediaText;
  if (!mediaText) return true;
  if (typeof rule.media.matches === "boolean") return rule.media.matches;
  return view.matchMedia(mediaText).matches;
}

function doesSupportsMatch(rule) {
  if (typeof rule.matches === "boolean") return rule.matches;
  const condition = rule.conditionText;
  if (!condition) return false;
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
  return CSS.supports(condition);
}

function findNamedContainer(element, name) {
  const view = element.ownerDocument.defaultView;
  if (!view) return null;
  let current = element;
  while (current) {
    const style = view.getComputedStyle(current);
    const names = style.containerName.split(",").map((part) => part.trim()).filter(Boolean);
    const isContainer = style.containerType !== "" && style.containerType !== "normal";
    if (isContainer && (name === "" || names.includes(name))) return current;
    current = current.parentElement;
  }
  return null;
}

function evaluateContainerQuery(queryText, containerEl) {
  const width = containerEl.getBoundingClientRect().width;
  const minMatch = queryText.match(/\(min-width:\s*([\d.]+)px\)/);
  if (minMatch) return width >= Number.parseFloat(minMatch[1]);
  const maxMatch = queryText.match(/\(max-width:\s*([\d.]+)px\)/);
  return maxMatch ? width <= Number.parseFloat(maxMatch[1]) : false;
}

function doesContainerMatch(rule, element) {
  if (typeof rule.matches === "boolean") return rule.matches;
  const query = rule.containerQuery;
  if (typeof query === "object" && query !== null && typeof query.matches === "boolean") {
    return query.matches;
  }
  const queryText = typeof query === "string" ? query : String(query);
  const container = findNamedContainer(element, rule.containerName ?? "");
  return container ? evaluateContainerQuery(queryText, container) : false;
}

function isGroupingRuleActive(rule, parentActive, element) {
  if (!parentActive) return false;
  if (isMediaRule(rule)) return doesMediaMatch(rule, element);
  if (isContainerRule(rule)) return doesContainerMatch(rule, element);
  if (isSupportsRule(rule)) return doesSupportsMatch(rule);
  return true;
}

function walkRule(rule, element, onStyleRule, order, active) {
  if (rule.type === CSSRule.STYLE_RULE) {
    if (!active) return order;
    onStyleRule(rule, order);
    return order + 1;
  }
  if (rule.cssRules) {
    const childActive = isGroupingRuleActive(rule, active, element);
    for (let i = 0; i < rule.cssRules.length; i += 1) {
      order = walkRule(rule.cssRules[i], element, onStyleRule, order, childActive);
    }
  }
  return order;
}

function findMatchingSelector(element, selectorText) {
  if (!selectorText) return null;
  const selectors = selectorText.split(",").map((part) => part.trim()).filter(Boolean);
  let best = null;
  for (const selector of selectors) {
    try {
      if (!element.matches(selector)) continue;
      const specificity = calculateSpecificity(selector);
      if (!best || specificity >= best.specificity) best = { selector, specificity };
    } catch {
      // Ignore selectors unsupported by the current browser.
    }
  }
  return best?.selector ?? null;
}

function calculateSpecificity(selector) {
  const withoutPseudoElements = selector.replace(/::[\w-]+/g, "");
  const ids = withoutPseudoElements.match(/#[\w-]+/g)?.length ?? 0;
  const classes = withoutPseudoElements.match(/(\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+(?:\([^)]*\))?)/g)?.length ?? 0;
  let elements = 0;
  for (const part of selector.split(/[\s>+~]/).filter(Boolean)) {
    const tag = part.replace(/(\.[\w-]+|#[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+(?:\([^)]*\))?|::[\w-]+)/g, "");
    if (/^([a-zA-Z][\w-]*|\*)/.test(tag.trim())) elements += 1;
  }
  elements += selector.match(/::[\w-]+/g)?.length ?? 0;
  return ids * 1e4 + classes * 100 + elements;
}

export { calculateSpecificity, collectInlineStyles, collectMatchingRules, doesContainerMatch, doesMediaMatch, doesSupportsMatch, evaluateContainerQuery, findMatchingSelector, findNamedContainer, isContainerRule, isGroupingRuleActive, isMediaRule, isSupportsRule, walkRule, walkStylesheetRules };
