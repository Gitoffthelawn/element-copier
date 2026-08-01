import { ElementHighlightVisual } from "./visual.js";
import { pickElementUnderCursor } from "../pick-mode/element-under-cursor.js";
import { removePageHighlightStyles } from "./page-styles.js";

var HighlightSystem = class {
  highlighted = null;
  visual;
  host;
  pageStyles;
  domMutationObserver = null;
  lastPointerX = -1;
  lastPointerY = -1;
  highlightRefreshRaf = 0;
  boundMove;
  boundPointerMove;
  boundScroll;
  boundResize;
  constructor(options) {
    this.host = options.host;
    this.pageStyles = options.pageStyles;
    this.visual = new ElementHighlightVisual(this.host, this.pageStyles);
    this.boundMove = (e) => this.updateHighlightAt(e.clientX, e.clientY);
    this.boundPointerMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      this.updateHighlightAt(e.clientX, e.clientY);
    };
    this.boundScroll = () => this.scheduleHighlightRefresh();
    this.boundResize = () => this.scheduleHighlightRefresh();
  }
  bindExistingElements(elementLabelEl, highlightFrameEl) {
    this.visual.bindExistingElements(elementLabelEl, highlightFrameEl);
  }
  activate() {
    this.visual.installPageStyles();
    this.lastPointerX = -1;
    this.lastPointerY = -1;
    this.domMutationObserver = new MutationObserver(
      () => this.scheduleHighlightRefresh()
    );
    this.domMutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "width", "height", "hidden"]
    });
    document.addEventListener("mousemove", this.boundMove, true);
    document.addEventListener("pointermove", this.boundPointerMove, true);
    document.addEventListener("scroll", this.boundScroll, true);
    window.addEventListener("resize", this.boundResize);
  }
  deactivate() {
    document.removeEventListener("mousemove", this.boundMove, true);
    document.removeEventListener("pointermove", this.boundPointerMove, true);
    document.removeEventListener("scroll", this.boundScroll, true);
    window.removeEventListener("resize", this.boundResize);
    this.domMutationObserver?.disconnect();
    this.domMutationObserver = null;
    if (this.highlightRefreshRaf) {
      cancelAnimationFrame(this.highlightRefreshRaf);
      this.highlightRefreshRaf = 0;
    }
    this.lastPointerX = -1;
    this.lastPointerY = -1;
    this.clear();
    removePageHighlightStyles(this.pageStyles.styleId);
  }
  getHighlighted() {
    return this.highlighted;
  }
  clear() {
    if (this.highlighted) {
      this.visual.removeTargetClass(this.highlighted);
      this.highlighted = null;
    }
    this.visual.clear();
  }
  clearIfTarget(target) {
    if (this.highlighted === target) {
      this.clear();
    }
  }
  syncElementLabel() {
    this.visual.syncElementLabel(this.highlighted);
  }
  updateHighlightAt(x, y) {
    this.lastPointerX = x;
    this.lastPointerY = y;
    const el = pickElementUnderCursor(x, y, {
      isOurNode: (node) => this.host.isOurNode(node)
    });
    if (!el) {
      this.clear();
      return;
    }
    this.setHighlighted(el);
  }
  scheduleHighlightRefresh() {
    if (this.highlightRefreshRaf) return;
    this.highlightRefreshRaf = requestAnimationFrame(() => {
      this.highlightRefreshRaf = 0;
      if (this.lastPointerX < 0) return;
      this.updateHighlightAt(this.lastPointerX, this.lastPointerY);
    });
  }
  setHighlighted(el) {
    if (this.highlighted === el) {
      if (el) this.visual.refresh(el);
      return;
    }
    const prev = this.highlighted;
    if (!el) {
      if (prev) this.visual.removeTargetClass(prev);
      this.highlighted = null;
      this.visual.clear();
      return;
    }
    if (prev) this.visual.removeTargetClass(prev);
    this.highlighted = el;
    this.visual.render(el, {
      animateFrom: prev,
      isStillTarget: (target) => this.highlighted === target
    });
  }
};

export { HighlightSystem };
