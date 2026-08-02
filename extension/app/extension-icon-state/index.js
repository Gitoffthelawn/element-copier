import { ICON_STATE_LOG_LABEL, ICON_SYNCED_TAB_IDS_KEY } from "./constants.js";
import { TOOLBAR_ICON_PATHS } from "../icon-paths.js";
import { createExtensionIconState } from "../extension-icon-state/create.js";

var iconState = createExtensionIconState({
  paths: TOOLBAR_ICON_PATHS,
  syncedTabIdsStorageKey: ICON_SYNCED_TAB_IDS_KEY,
  logLabel: ICON_STATE_LOG_LABEL
});

var {
  bootstrapToolbarIcons,
  forgetIconSyncedTab,
  onContentActiveChanged: onContentActiveChanged2,
  registerExtensionIconStateListeners: registerExtensionIconStateListeners2,
  setGlobalToolbarIcon,
  syncIconForTab
} = iconState;

export { bootstrapToolbarIcons, forgetIconSyncedTab, iconState, onContentActiveChanged2, registerExtensionIconStateListeners2, setGlobalToolbarIcon, syncIconForTab };
