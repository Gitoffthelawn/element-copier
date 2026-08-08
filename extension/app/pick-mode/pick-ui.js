import { COPIER_HIGHLIGHT_PAGE_STYLE, HIGHLIGHT_UI } from "./page-styles.js";
import { HighlightSystem } from "../highlight/selector.js";
import { PICK_HOST_ATTR, PICK_ROOT_ID } from "./constants.js";
import { findIframeAtPoint, isPointInElement } from "./element-under-cursor.js";
import { formatFrameElementLabel, formatTagIdClassLabel } from "./element-label.js";
import { getCachedFrameClickToCopyLabel, getCachedFrameLabelStyle, getCachedPickParentContextMenuTitle, subscribeFrameLabelStyleChange } from "../settings/format-settings-cache.js";
import { sendToBackground } from "../messages.js";

var CopierPickUI = class {
  host;
  shadow;
  highlight;
  onPick;
  boundClick;
  boundContextMenu;
  contextMenu = null;
  unsubscribeFrameLabelStyle;
  constructor(onPick) {
    this.onPick = onPick;
    this.boundClick = (e) => this.handleClick(e);
    this.boundContextMenu = (e) => this.handleContextMenu(e);
    const existing = document.getElementById(PICK_ROOT_ID);
    if (existing?.isConnected) {
      this.host = existing;
      this.shadow = existing.shadowRoot ?? existing.attachShadow({ mode: "open" });
    } else {
      existing?.remove();
      const root2 = document.documentElement ?? document.body;
      if (!root2) {
        throw new Error("document has no mount root");
      }
      this.host = document.createElement("div");
      this.host.id = PICK_ROOT_ID;
      this.host.setAttribute(PICK_HOST_ATTR, "true");
      this.host.style.cssText = "position:fixed;inset:0;z-index:2147483645;pointer-events:none;";
      root2.appendChild(this.host);
      this.shadow = this.host.attachShadow({ mode: "open" });
    }
    let style = this.shadow.querySelector("style");
    if (!style) {
      style = document.createElement("style");
      this.shadow.appendChild(style);
    }
    style.textContent = ":host {\n  all: initial;\n  position: fixed;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  z-index: 2147483645;\n  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;\n  font-size: 14px;\n  line-height: 1.3;\n  color: #fff;\n}\n\n*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}\n\n@keyframes ec-highlight-pulse {\n  0%,\n  100% {\n    outline-color: rgba(1, 34, 146, 0.95);\n    box-shadow:\n      0 0 10px 2px rgba(1, 34, 146, 0.45),\n      0 0 20px 6px rgba(1, 34, 146, 0.22);\n  }\n  50% {\n    outline-color: rgba(1, 34, 146, 0.75);\n    box-shadow:\n      0 0 14px 4px rgba(1, 34, 146, 0.55),\n      0 0 28px 10px rgba(1, 34, 146, 0.38);\n  }\n}\n\n.ec-highlight-frame {\n  position: absolute;\n  z-index: 0;\n  display: none;\n  pointer-events: none;\n  box-sizing: border-box;\n  background: rgba(1, 34, 146, 0.18);\n  outline-width: 1px;\n  outline-style: solid;\n  outline-offset: 2px;\n  box-shadow:\n    0 0 10px 2px rgba(1, 34, 146, 0.45),\n    0 0 20px 6px rgba(1, 34, 146, 0.22);\n  animation: ec-highlight-pulse 2s ease-in-out infinite;\n  transition:\n    top 0.15s ease,\n    left 0.15s ease,\n    width 0.15s ease,\n    height 0.15s ease,\n    border-radius 0.15s ease;\n}\n\n.ec-highlight-frame.is-instant {\n  transition: none;\n}\n\n.ec-element-label {\n  position: absolute;\n  z-index: 1;\n  display: none;\n  pointer-events: none;\n  margin: 0;\n  padding: 0.15rem 0.35rem;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;\n  font-size: 0.68rem;\n  font-weight: 600;\n  line-height: 1.2;\n  white-space: nowrap;\n  color: #fff;\n  border-radius: 0.25rem;\n  background: rgba(1, 34, 146, 0.96);\n  border: 1px solid rgba(255, 255, 255, 0.38);\n  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.18);\n  transform: translateY(-100%);\n}\n";
    style.textContent += `
      .ec-parent-context-menu {
        position: fixed;
        z-index: 2;
        display: grid;
        gap: 2px;
        width: min(21rem, calc(100vw - 16px));
        max-height: min(24rem, calc(100vh - 16px));
        overflow: auto;
        padding: 6px;
        color: #172033;
        background: #fff;
        border: 1px solid rgba(23, 32, 51, 0.22);
        border-radius: 8px;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
        pointer-events: auto;
      }
      .ec-parent-context-menu button {
        width: 100%; padding: 7px 9px; overflow: hidden;
        font: 600 12px/1.25 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        text-align: left; text-overflow: ellipsis; white-space: nowrap; color: inherit;
        cursor: pointer; background: transparent; border: 0; border-radius: 5px;
      }
      .ec-parent-context-menu-title {
        padding: 5px 9px 7px;
        font-size: 14px;
        font-weight: 800;
        color: #012292;
        border-bottom: 1px solid rgba(23, 32, 51, 0.16);
      }
      .ec-parent-context-menu button:hover,
      .ec-parent-context-menu button:focus-visible { color: #fff; outline: none; background: #012292; }
      .ec-parent-context-menu button[aria-current="true"] { font-weight: 800; }
    `;
    const existingLabel = this.shadow.querySelector(".ec-element-label");
    const existingFrame = this.shadow.querySelector(".ec-highlight-frame");
    this.highlight = new HighlightSystem({
      host: {
        shadow: this.shadow,
        isOurNode: (node) => this.isOurNode(node),
        getElementLabelEnabled: () => getCachedFrameLabelStyle() !== "none",
        formatElementLabel: (target) => formatFrameElementLabel(
          target,
          getCachedFrameLabelStyle(),
          getCachedFrameClickToCopyLabel()
        ),
        hostAttr: PICK_HOST_ATTR,
        classes: HIGHLIGHT_UI
      },
      pageStyles: COPIER_HIGHLIGHT_PAGE_STYLE
    });
    this.highlight.bindExistingElements(
      existingLabel instanceof HTMLElement ? existingLabel : null,
      existingFrame instanceof HTMLElement ? existingFrame : null
    );
    this.unsubscribeFrameLabelStyle = subscribeFrameLabelStyleChange(() => {
      this.syncFrameLabel();
    });
  }
  syncFrameLabel() {
    this.highlight.syncElementLabel();
  }
  isHostConnected() {
    return this.host.isConnected;
  }
  isOurNode(node) {
    if (!node) return true;
    if (node === this.host || this.host.contains(node)) return true;
    return !!node.closest?.(`[${PICK_HOST_ATTR}]`);
  }
  activate() {
    this.highlight.activate();
    document.addEventListener("click", this.boundClick, true);
    document.addEventListener("contextmenu", this.boundContextMenu, true);
  }
  deactivate() {
    document.removeEventListener("click", this.boundClick, true);
    document.removeEventListener("contextmenu", this.boundContextMenu, true);
    this.closeContextMenu(false);
    this.highlight.deactivate();
  }
  dispose() {
    this.unsubscribeFrameLabelStyle();
    this.deactivate();
  }
  handleClick(e) {
    if (this.contextMenu) {
      if (e.composedPath().includes(this.contextMenu)) return;
      this.closeContextMenu();
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }
    const pickOptions = { isOurNode: (node) => this.isOurNode(node) };
    const iframeAtPoint = findIframeAtPoint(e.clientX, e.clientY, pickOptions);
    const target = iframeAtPoint ?? this.highlight.getHighlighted();
    if (!target) return;
    const hit = e.target;
    if (hit instanceof Element && this.isOurNode(hit)) return;
    const onTarget = hit === target || hit instanceof Element && target.contains(hit) || isPointInElement(target, e.clientX, e.clientY);
    if (!onTarget) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    this.onPick(target);
  }
  getAncestorChain(target) {
    const chain = [];
    for (let node = target; node instanceof Element; node = node.parentElement) chain.unshift(node);
    return chain;
  }
  closeContextMenu(resumeTracking = true) {
    this.contextMenu?.remove();
    this.contextMenu = null;
    if (resumeTracking) this.highlight.resumeTracking();
  }
  handleContextMenu(e) {
    const target = this.highlight.getHighlighted();
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (!target || this.isOurNode(e.target) || !isPointInElement(target, e.clientX, e.clientY)) return;
    this.openContextMenu(target, e.clientX, e.clientY);
  }
  openContextMenu(target, x, y) {
    this.closeContextMenu(false);
    this.highlight.pauseTracking();
    const menu = document.createElement("div");
    menu.className = "ec-parent-context-menu";
    menu.setAttribute(PICK_HOST_ATTR, "true");
    menu.setAttribute("role", "menu");
    const title = document.createElement("div");
    title.className = "ec-parent-context-menu-title";
    title.textContent = getCachedPickParentContextMenuTitle();
    menu.appendChild(title);
    for (const element of this.getAncestorChain(target)) {
      const item = document.createElement("button");
      const isCurrent = element === target;
      item.type = "button";
      item.textContent = isCurrent ? "THIS ELEMENT" : formatTagIdClassLabel(element);
      item.title = formatTagIdClassLabel(element);
      item.setAttribute("role", "menuitem");
      if (isCurrent) item.setAttribute("aria-current", "true");
      item.addEventListener("mouseenter", () => this.highlight.setHighlighted(element));
      item.addEventListener("focus", () => this.highlight.setHighlighted(element));
      item.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.closeContextMenu(false);
        this.onPick(element);
      });
      menu.appendChild(item);
    }
    this.shadow.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - rect.width - 8))}px`;
    menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - rect.height - 8))}px`;
    this.contextMenu = menu;
  }
};

function notifyElementPicked(element) {
  sendToBackground({
    type: "ELEMENT_PICKED",
    tagName: element.tagName,
    id: element.id,
    className: element.className
  });
}

export { CopierPickUI, notifyElementPicked };
