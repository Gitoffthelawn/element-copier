function isInlineLikeDisplay(display) {
  return display === "inline" || display.startsWith("inline-") || display === "contents";
}

function mergeInlineStyle(element, extra) {
  const current = element.getAttribute("style")?.trim();
  element.setAttribute("style", current ? `${current};${extra}` : extra);
}

export { isInlineLikeDisplay, mergeInlineStyle };
