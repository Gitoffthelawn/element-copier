function mountPanelShadowHost(options) {
  const host = document.createElement("div");
  host.id = options.rootId;
  host.className = options.hostClassName;
  host.setAttribute(options.hostAttr, "true");
  host.style.cssText = options.hostStyle;
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = options.cssContent;
  shadow.appendChild(style);
  return { host, shadow };
}

export { mountPanelShadowHost };
