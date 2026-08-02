import { DARK_THEME_ENABLED_KEY } from "../messages.js";
import { PANEL_POPUP_ROOT_ID } from "./constants.js";
import { ext } from "../api.js";
import { getDarkThemeEnabled } from "../settings/theme-settings.js";

var HOST_DARK_CLASS = "ec-panel-popup--dark";

var PANEL_DARK_CLASS2 = "ec-panel--dark";

var themeSyncBound = false;

function applyPanelTheme(enabled) {
  const host = document.getElementById(PANEL_POPUP_ROOT_ID);
  host?.classList.toggle(HOST_DARK_CLASS, enabled);
  host?.shadowRoot?.querySelectorAll(".ec-panel").forEach((panel) => panel.classList.toggle(PANEL_DARK_CLASS2, enabled));
}

async function syncPanelThemeFromStorage() {
  applyPanelTheme(await getDarkThemeEnabled());
}

function bindPanelThemeSync() {
  if (themeSyncBound) return;
  themeSyncBound = true;
  ext.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[DARK_THEME_ENABLED_KEY]) return;
    applyPanelTheme(changes[DARK_THEME_ENABLED_KEY].newValue === true);
  });
}

export { HOST_DARK_CLASS, PANEL_DARK_CLASS2, applyPanelTheme, bindPanelThemeSync, syncPanelThemeFromStorage, themeSyncBound };
