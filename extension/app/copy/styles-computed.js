function getElementComputedStyles(element) {
  const computed = element.ownerDocument.defaultView?.getComputedStyle(element);
  if (!computed) return "";
  const decls = [];
  for (let i = 0; i < computed.length; i += 1) {
    const name = computed.item(i);
    if (!name) continue;
    const value = computed.getPropertyValue(name);
    if (value) decls.push(`${name}: ${value};`);
  }
  return decls.join("\n");
}

export { getElementComputedStyles };
