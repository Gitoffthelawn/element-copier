import { ext } from "../api.js";

async function showBlockedNotice(tabId, config, payload, windowId) {
  const { popupHtml, sessionKey, logLabel } = config;
  void ext.storage.session.set({
    [sessionKey]: { ...payload, tabId }
  });
  let winId = windowId;
  if (winId === void 0) {
    try {
      const tab = await ext.tabs.get(tabId);
      winId = tab.windowId;
    } catch {
    }
  }
  try {
    await ext.action.setPopup({ tabId, popup: popupHtml });
    const openPopup = ext.action.openPopup;
    if (openPopup && winId !== void 0) {
      await openPopup({ windowId: winId });
      return;
    }
    throw new Error("action.openPopup unavailable");
  } catch (err) {
    console.debug(`[${logLabel}] openPopup notice failed:`, err);
  } finally {
    await ext.action.setPopup({ tabId, popup: "panel-popup-page.html" });
  }
}

export { showBlockedNotice };
