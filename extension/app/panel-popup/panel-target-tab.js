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

export { PANEL_TARGET_TAB_SESSION_KEY, readPanelTargetTabId, rememberPanelTargetTab };
