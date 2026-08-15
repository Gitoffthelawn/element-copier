import { ext } from "../api.js";
import { panelPagePath } from "./page-path.js";

function openPanelInActionPopup(config, panelTab, target, extraParams) {
  const { tabId, windowId } = target;
  const popup = panelPagePath(
    config.pageHtml,
    panelTab,
    extraParams,
    config.tabQueryParam
  );
  const setPopupDetails = tabId !== void 0 ? { tabId, popup } : { popup };
  // An empty tab override disables the manifest popup in Firefox. Restore the
  // normal panel explicitly so every later toolbar click remains native.
  const clearPopupDetails = tabId !== void 0
    ? { tabId, popup: "panel-popup-page.html" }
    : { popup: "panel-popup-page.html" };
  void (async () => {
    // Firefox before 149 requires openPopup to be invoked while the menu click
    // still has user activation. Queue the popup update but do not await it
    // before invoking openPopup; WebExtension calls are processed in order.
    const setPopupPromise = ext.action.setPopup(setPopupDetails);
    try {
      const openPopup = ext.action.openPopup;
      if (!openPopup) throw new Error("action.openPopup unavailable");
      await openPopup({ windowId });
    } catch (err) {
      console.debug(`[${config.logLabel}] openPopup panel failed:`, err);
    } finally {
      try {
        await setPopupPromise;
      } catch (err) {
        console.debug(`[${config.logLabel}] setPopup panel failed:`, err);
      }
      await ext.action.setPopup(clearPopupDetails);
    }
  })();
}

export { openPanelInActionPopup };
