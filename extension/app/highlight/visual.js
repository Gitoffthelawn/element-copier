import { ensurePageHighlightStyles, removePageHighlightStyles } from "./page-styles.js";
import { isIframeHitTestable, isSignificantIframe, listIframesWithin } from "../pick-mode/element-under-cursor.js";

var HIGHLIGHT_FRAME_INSET = 2;

var ElementHighlightVisual = class {
  constructor(host, pageStyles) {
    this.host = host;
    this.pageStyles = pageStyles;
  }
  elementLabelEl = null;
  highlightFrameEl = null;
  highlightTransitionToken = 0;
  highlightTransitionCleanup = null;
  bindExistingElements(elementLabelEl, highlightFrameEl) {
    this.elementLabelEl = elementLabelEl;
    this.highlightFrameEl = highlightFrameEl;
  }
  installPageStyles() {
    ensurePageHighlightStyles(this.pageStyles);
  }
  uninstallPageStyles() {
    removePageHighlightStyles(this.pageStyles.styleId);
  }
  clear() {
    this.cancelHighlightTransition();
    this.clearTargetMarkers();
    this.hideHighlightFrame();
    this.hideElementLabel();
  }
  syncElementLabel(target) {
    if (!this.host.getElementLabelEnabled() || !target) {
      this.hideElementLabel();
      return;
    }
    const label = this.ensureElementLabel();
    label.textContent = this.host.formatElementLabel(target);
    label.style.display = "block";
    this.syncElementLabelPosition(target);
  }
  render(target, options) {
    const { animateFrom } = options;
    const targetClass = this.host.classes.highlightTarget;
    this.cancelHighlightTransition();
    this.hideElementLabel();
    const animate = animateFrom !== null && animateFrom.isConnected && animateFrom !== target;
    if (!animate) {
      this.showHighlightFrameFor(target);
      target.classList.add(targetClass);
      this.syncIframeFill(target);
      this.syncElementLabel(target);
      return;
    }
    this.runHighlightTransition(animateFrom, target, options.isStillTarget);
    this.syncElementLabel(target);
  }
  refresh(target) {
    this.syncIframeFill(target);
    this.syncHighlightOverlay(target);
    this.syncElementLabel(target);
  }
  removeTargetClass(target) {
    target.classList.remove(this.host.classes.highlightTarget);
  }
  clearTargetMarkers() {
    this.clearIframeFill();
  }
  clearIframeFill() {
    const fillClass = this.host.classes.highlightFill;
    for (const node of Array.from(
      document.querySelectorAll(`iframe.${fillClass}`)
    )) {
      node.classList.remove(fillClass);
    }
  }
  rectOverlapArea(a, b) {
    const left = Math.max(a.left, b.left);
    const right = Math.min(a.right, b.right);
    const top = Math.max(a.top, b.top);
    const bottom = Math.min(a.bottom, b.bottom);
    if (right <= left || bottom <= top) return 0;
    return (right - left) * (bottom - top);
  }
  collectIframeFillTargets(target) {
    if (target instanceof HTMLIFrameElement) {
      return isIframeHitTestable(target) && isSignificantIframe(target) ? [target] : [];
    }
    const out = [];
    const targetRect = target.getBoundingClientRect();
    for (const node of listIframesWithin(target, (n) => this.host.isOurNode(n))) {
      if (!isIframeHitTestable(node) || !isSignificantIframe(node)) {
        continue;
      }
      const rect = node.getBoundingClientRect();
      const iframeArea = rect.width * rect.height;
      if (iframeArea <= 0) continue;
      if (this.rectOverlapArea(targetRect, rect) / iframeArea >= 0.5) {
        out.push(node);
      }
    }
    return out;
  }
  syncIframeFill(target) {
    const fillClass = this.host.classes.highlightFill;
    this.clearIframeFill();
    for (const iframe of this.collectIframeFillTargets(target)) {
      iframe.classList.add(fillClass);
    }
  }
  cancelHighlightTransition() {
    this.highlightTransitionToken += 1;
    this.highlightTransitionCleanup?.();
    this.highlightTransitionCleanup = null;
  }
  ensureHighlightFrame() {
    if (!this.highlightFrameEl) {
      const el = document.createElement("div");
      el.className = this.host.classes.highlightFrame;
      el.setAttribute(this.host.hostAttr, "true");
      el.setAttribute("aria-hidden", "true");
      this.host.shadow.insertBefore(el, this.host.shadow.firstChild);
      this.highlightFrameEl = el;
    }
    return this.highlightFrameEl;
  }
  hideHighlightFrame() {
    if (!this.highlightFrameEl) return;
    this.highlightFrameEl.style.display = "none";
  }
  showHighlightFrameFor(target) {
    const frame = this.ensureHighlightFrame();
    frame.style.display = "block";
    this.applyHighlightFrame(frame, target);
  }
  syncHighlightFrame(target) {
    const frame = this.highlightFrameEl;
    if (!frame || frame.style.display === "none") return;
    this.applyHighlightFrame(frame, target);
  }
  syncHighlightOverlay(target) {
    this.syncHighlightFrame(target);
    this.syncElementLabelPosition(target);
  }
  applyHighlightFrame(frame, target) {
    const rect = target.getBoundingClientRect();
    frame.style.top = `${rect.top}px`;
    frame.style.left = `${rect.left}px`;
    frame.style.width = `${rect.width}px`;
    frame.style.height = `${rect.height}px`;
    const style = getComputedStyle(target);
    frame.style.borderRadius = style.borderRadius;
    const clipPath = style.clipPath;
    frame.style.clipPath = clipPath && clipPath !== "none" ? clipPath : "";
  }
  runHighlightTransition(from, to, isStillTarget) {
    const frame = this.ensureHighlightFrame();
    const targetClass = this.host.classes.highlightTarget;
    const token = this.highlightTransitionToken;
    let done = false;
    if (frame.style.display !== "block") {
      frame.classList.add("is-instant");
      frame.style.display = "block";
      this.applyHighlightFrame(frame, from);
      frame.classList.remove("is-instant");
      void frame.offsetWidth;
    } else {
      frame.style.display = "block";
    }
    this.applyHighlightFrame(frame, to);
    const finish = () => {
      if (done) return;
      if (token !== this.highlightTransitionToken) return;
      if (isStillTarget && !isStillTarget(to)) return;
      done = true;
      this.highlightTransitionCleanup?.();
      this.highlightTransitionCleanup = null;
      this.showHighlightFrameFor(to);
      to.classList.add(targetClass);
      this.syncIframeFill(to);
      this.syncElementLabel(to);
    };
    const onTransitionEnd = (event) => {
      if (event.target !== frame) return;
      if (event.propertyName !== "width") return;
      finish();
    };
    frame.addEventListener("transitionend", onTransitionEnd);
    const timeoutId = window.setTimeout(finish, 225);
    this.highlightTransitionCleanup = () => {
      frame.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(timeoutId);
    };
  }
  ensureElementLabel() {
    if (!this.elementLabelEl) {
      const el = document.createElement("div");
      el.className = this.host.classes.elementLabel;
      el.setAttribute(this.host.hostAttr, "true");
      el.setAttribute("aria-hidden", "true");
      this.host.shadow.appendChild(el);
      this.elementLabelEl = el;
    }
    return this.elementLabelEl;
  }
  hideElementLabel() {
    if (!this.elementLabelEl) return;
    this.elementLabelEl.style.display = "none";
  }
  syncElementLabelPosition(target) {
    const el = this.elementLabelEl;
    if (!el || el.style.display === "none") return;
    const rect = target.getBoundingClientRect();
    const frameTop = rect.top - HIGHLIGHT_FRAME_INSET;
    const frameLeft = rect.left - HIGHLIGHT_FRAME_INSET;
    el.style.top = `${frameTop}px`;
    el.style.left = `${frameLeft}px`;
  }
};

export { ElementHighlightVisual, HIGHLIGHT_FRAME_INSET };
