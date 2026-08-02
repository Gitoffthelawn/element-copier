import { PREFIX_ACTION_KEY } from "./commands.js";
import { getEscHotkeyEnabled, getStartHotkeyEnabled } from "./settings.js";
import { isEscHotkeyEvent } from "./keys.js";
import { notifyPrefixHintBlockedOnBackground, queryPrefixHintCanShowFromBackground } from "../hotkeys/prefix-operability.js";
import { registerContentHotkey2, unregisterContentHotkey2 } from "./registry.js";
import { registerPrefixStartHotkey } from "../hotkeys/prefix-content.js";

var HOTKEY_NAMESPACE2 = "elementCopier";

var contentHotkeysMounted = false;

function registerCopierStartHotkey(requestToggle2, requestCopyPage2) {
  registerPrefixStartHotkey({
    namespace: HOTKEY_NAMESPACE2,
    hintLetter: PREFIX_ACTION_KEY,
    isEnabled: getStartHotkeyEnabled,
    canShowPrefixHint: queryPrefixHintCanShowFromBackground,
    onPrefixHintBlocked: notifyPrefixHintBlockedOnBackground,
    onAction: requestToggle2,
    onDoubleAction: requestCopyPage2
  });
}

function mountCopierContentHotkeys(host, slots = ["esc"]) {
  if (typeof window !== "undefined" && window.top !== window) return;
  if (contentHotkeysMounted) return;
  contentHotkeysMounted = true;
  if (slots.includes("esc")) {
    registerContentHotkey2("esc", (e) => {
      if (!isEscHotkeyEvent(e)) return;
      if (!host.isActive()) return;
      void (async () => {
        if (!await getEscHotkeyEnabled()) return;
        e.preventDefault();
        e.stopPropagation();
        host.deactivate();
      })();
    });
  }
}

function unmountCopierContentHotkeys(slots = ["esc"]) {
  if (!contentHotkeysMounted) return;
  contentHotkeysMounted = false;
  for (const slot of slots) {
    unregisterContentHotkey2(slot);
  }
}

export { HOTKEY_NAMESPACE2, contentHotkeysMounted, mountCopierContentHotkeys, registerCopierStartHotkey, unmountCopierContentHotkeys };
