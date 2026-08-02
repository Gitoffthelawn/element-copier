import { PANEL_PAGE_CONFIG, PANEL_POPUP_PAGE, PANEL_POPUP_TABS } from "./constants.js";
import { hasPickCopyCacheInStorage } from "../pick-mode/pick-copy-cache-storage.js";
import { isPanelPage } from "../panel-popup/page-path.js";
import { isPanelTabMode } from "../panel-tab/index.js";
import { mountPanelPopup } from "./mount.js";
import { resolvePanelPageInitialTab } from "../panel-popup/resolve-tab.js";

function isPanelPopupPage(href) {
  return isPanelPage(href, PANEL_POPUP_PAGE);
}

async function resolvePanelPageInitialTab2() {
  const tab = await resolvePanelPageInitialTab({
    sessionTabKey: PANEL_PAGE_CONFIG.sessionTabKey,
    defaultTab: "start",
    validTabs: PANEL_POPUP_TABS
  });
  if (tab !== "start") return tab;
  return await hasPickCopyCacheInStorage() ? "copied" : "start";
}

async function bootstrapPanelPopupPageIfNeeded() {
  if (!isPanelPopupPage(location.href)) return;
  if (isPanelTabMode()) return;
  const tab = await resolvePanelPageInitialTab2();
  await mountPanelPopup(tab);
}

export { bootstrapPanelPopupPageIfNeeded, isPanelPopupPage, resolvePanelPageInitialTab2 };
