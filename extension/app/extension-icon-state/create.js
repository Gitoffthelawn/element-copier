import { createIconSync } from "./icon-sync.js";
import { onContentActiveChanged, registerExtensionIconStateListeners } from "./listeners.js";

function createExtensionIconState(config) {
  const sync = createIconSync(config);
  return {
    bootstrapToolbarIcons: sync.bootstrapToolbarIcons,
    forgetIconSyncedTab: sync.forgetIconSyncedTab,
    setGlobalToolbarIcon: sync.setGlobalToolbarIcon,
    syncIconForTab: sync.syncIconForTab,
    registerExtensionIconStateListeners: () => registerExtensionIconStateListeners(sync),
    onContentActiveChanged: (tabId, active) => {
      onContentActiveChanged(sync, tabId, active);
    }
  };
}

export { createExtensionIconState };
