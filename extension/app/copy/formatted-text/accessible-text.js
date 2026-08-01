function getElementAccessiblePlain(element) {
  const inner = ("innerText" in element ? element.innerText : element.textContent)?.trim() ?? "";
  if (inner) return inner;
  if (element instanceof HTMLImageElement) {
    return element.alt.trim();
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value.trim() || element.placeholder.trim();
  }
  const labeled = element.getAttribute("aria-label")?.trim() || element.getAttribute("title")?.trim();
  if (labeled) return labeled;
  const parts = [];
  const imgs = element.querySelectorAll("img[alt]");
  for (let i = 0; i < imgs.length; i += 1) {
    const alt = imgs[i].getAttribute("alt")?.trim();
    if (alt) parts.push(alt);
  }
  if (parts.length > 0) {
    return parts.join("\n");
  }
  return (element.textContent ?? "").trim();
}

export { getElementAccessiblePlain };
