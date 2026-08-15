import { ext } from "../api.js";

var PANEL_TARGET_TAB_SESSION_KEY = "panelTargetTabId";

async function rememberPanelTargetTab(tabId) {
  await ext.storage.session.set({ [PANEL_TARGET_TAB_SESSION_KEY]: tabId });
}

async function readPanelTargetTabId() {
  const data = await ext.storage.session.get(PANEL_TARGET_TAB_SESSION_KEY);
  const id = data[PANEL_TARGET_TAB_SESSION_KEY];
  return typeof id === "number" ? id : void 0;
}

function selectPanelTargetTabId(options) {
  if (
    options.senderTabId !== void 0 &&
    !options.senderIsExtensionPanel
  ) {
    return options.senderTabId;
  }
  // Native action popups are extension documents without sender.tab. Their
  // target is the tab that is active behind the popup, not a target retained
  // by an earlier popup session.
  if (options.senderTabId === void 0) {
    return options.activeTabId;
  }
  return options.rememberedTabId ?? options.activeTabId;
}

export {
  PANEL_TARGET_TAB_SESSION_KEY,
  readPanelTargetTabId,
  rememberPanelTargetTab,
  selectPanelTargetTabId
};
