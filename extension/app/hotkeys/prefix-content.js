import { createContentPrefixHintSink } from "./prefix-hint-content.js";
import { createPrefixModeController } from "./prefix-mode.js";
import { registerContentHotkey } from "./registry.js";

function registerPrefixStartHotkey(options) {
  if (typeof window === "undefined" || window.top !== window) return void 0;
  const controller = createPrefixModeController({
    hintLetter: options.hintLetter,
    hint: createContentPrefixHintSink(),
    isEnabled: options.isEnabled,
    canShowPrefixHint: options.canShowPrefixHint,
    onPrefixHintBlocked: options.onPrefixHintBlocked,
    onAction: options.onAction,
    onDoubleAction: options.onDoubleAction,
    doubleActionWindowMs: options.doubleActionWindowMs
  });
  registerContentHotkey(options.namespace, "prefix-chord", (e) => {
    controller.onPrefixChordKeyDown(e);
  });
  const onKeyUp = (e) => {
    controller.onPrefixChordKeyUp(e);
  };
  const win = window;
  const keyUpProp = `__${options.namespace}_prefixKeyUp`;
  const prev = win[keyUpProp];
  if (prev) window.removeEventListener("keyup", prev, true);
  win[keyUpProp] = onKeyUp;
  window.addEventListener("keyup", onKeyUp, true);
  registerContentHotkey(options.namespace, "prefix-action", (e) => {
    controller.onPrefixActionKeyDown(e);
  });
  return controller;
}

export { registerPrefixStartHotkey };
