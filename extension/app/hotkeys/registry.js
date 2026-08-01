function handlerPropertyKey(namespace, slot) {
  return `__${namespace}HotkeyHandler_${slot}`;
}

function registerContentHotkey(namespace, slot, handler) {
  const win = window;
  const key = handlerPropertyKey(namespace, slot);
  const prev = win[key];
  if (prev) window.removeEventListener("keydown", prev, true);
  win[key] = handler;
  window.addEventListener("keydown", handler, true);
}

function unregisterContentHotkey(namespace, slot) {
  const win = window;
  const key = handlerPropertyKey(namespace, slot);
  const prev = win[key];
  if (!prev) return;
  window.removeEventListener("keydown", prev, true);
  win[key] = void 0;
}

var HOTKEY_NAMESPACE = "elementCopier";

function registerContentHotkey2(slot, handler) {
  registerContentHotkey(HOTKEY_NAMESPACE, slot, handler);
}

function unregisterContentHotkey2(slot) {
  unregisterContentHotkey(HOTKEY_NAMESPACE, slot);
}

export { HOTKEY_NAMESPACE, handlerPropertyKey, registerContentHotkey, registerContentHotkey2, unregisterContentHotkey, unregisterContentHotkey2 };
