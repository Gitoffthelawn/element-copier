import { PANEL_PAGE_CONFIG } from "./constants.js";
import { hasPickCopyCachePresentSync } from "../pick-mode/pick-copy-cache-storage.js";
import { markPanelSessionOpened } from "./panel-session.js";
import { openPanelInActionPopup } from "../panel-popup/open-action-popup.js";
import { rememberPanelTargetTab } from "./panel-target-tab.js";

function openPanelInActionPopup2(panelTab, target) {
  markPanelSessionOpened();
  if (target.tabId !== void 0) {
    void rememberPanelTargetTab(target.tabId);
  }
  openPanelInActionPopup(
    PANEL_PAGE_CONFIG,
    panelTab,
    target
  );
}

function openPanelFromSender(panelTab, senderTab) {
  openPanelInActionPopup2(panelTab, {
    tabId: senderTab?.id,
    windowId: senderTab?.windowId
  });
}

function openStartPanelFromToolbar(senderTab) {
  const tab = hasPickCopyCachePresentSync() ? "copied" : "start";
  openPanelFromSender(tab, senderTab);
}

function openCopiedPanelFromCopy(senderTab) {
  openPanelFromSender("copied", senderTab);
}

export { openCopiedPanelFromCopy, openPanelFromSender, openPanelInActionPopup2, openStartPanelFromToolbar };
