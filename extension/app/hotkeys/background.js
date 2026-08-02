import { COPIER_ACTIVE_COLOR } from "../brand.js";
import { createToggleCommandSuppressTracker } from "../hotkeys/suppress.js";
import { ext } from "../api.js";
import { getStartHotkeyEnabled } from "./settings.js";
import { registerPrefixBackgroundHotkeys } from "../hotkeys/prefix-background.js";

var TOGGLE_COMMAND = "activate-deactivate";

var DEACTIVATE_COMMAND = "deactivate-copy-mode";

var toggleCommandSuppress = createToggleCommandSuppressTracker();

function shouldSuppressToolbarClickAfterHotkeyCommand(now = Date.now()) {
  return toggleCommandSuppress.shouldSuppressToolbarClick(now);
}

function registerBackgroundHotkeys(host) {
  registerPrefixBackgroundHotkeys({
    badgeBackgroundColor: COPIER_ACTIVE_COLOR,
    getActiveCommandTab: host.getActiveCommandTab,
    isToggleEnabled: getStartHotkeyEnabled,
    toggleRequestMessageType: "TOGGLE_REQUEST",
    onToggleRequest: (tabId, windowId) => host.toggleTab(tabId, windowId, void 0, "hotkey"),
    suppress: toggleCommandSuppress
  });
  // Manifest commands (user-assignable in chrome://extensions/shortcuts). These run in
  // the background and grant activeTab, so pick/copy works without a prior content inject.
  // Page-side Ctrl+Shift+X → C still needs content on the page (see compliance.md).
  ext.commands.onCommand.addListener((command) => {
    if (command === TOGGLE_COMMAND) {
      toggleCommandSuppress.stampToggleCommand();
      void (async () => {
        const tab = await host.getActiveCommandTab();
        if (tab?.id === void 0) return;
        if (!await getStartHotkeyEnabled()) return;
        await host.toggleTab(tab.id, tab.windowId, void 0, "hotkey");
      })();
      return;
    }
    if (command === DEACTIVATE_COMMAND) {
      void (async () => {
        const tab = await host.getActiveCommandTab();
        if (tab?.id === void 0) return;
        await host.deactivateTab?.(tab.id, tab.windowId);
      })();
    }
  });
}

export { DEACTIVATE_COMMAND, TOGGLE_COMMAND, registerBackgroundHotkeys, shouldSuppressToolbarClickAfterHotkeyCommand, toggleCommandSuppress };
