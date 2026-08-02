import { ext } from "../api.js";
import { isActionOnToolbar, onActionToolbarChanged } from "../pin.js";

var welcomePinWatchers = /* @__PURE__ */ new Map();

function stopWelcomePinWatcher(tabId) {
  welcomePinWatchers.get(tabId)?.();
  welcomePinWatchers.delete(tabId);
}

function notifyWelcomePinned(tabId, messageType) {
  void ext.tabs.sendMessage(tabId, { type: messageType, pinned: true }).catch(() => {
  });
  stopWelcomePinWatcher(tabId);
}

function watchWelcomePinStatus(tabId, config) {
  stopWelcomePinWatcher(tabId);
  void isActionOnToolbar(ext.action).then((pinned) => {
    if (pinned === true) notifyWelcomePinned(tabId, config.pinStatusChangedMessageType);
  });
  const stop = onActionToolbarChanged(ext.action, (pinned) => {
    if (!pinned) return;
    notifyWelcomePinned(tabId, config.pinStatusChangedMessageType);
  });
  welcomePinWatchers.set(tabId, stop);
}

async function openWelcomeTab(config, data) {
  await ext.storage.session.set({
    [config.sessionDataKey]: data
  });
  try {
    await ext.tabs.create({
      url: ext.runtime.getURL(config.pageHtml),
      active: true
    });
  } catch (err) {
    console.error(`[${config.logLabel}] welcome tab failed:`, err);
  }
}

export { notifyWelcomePinned, openWelcomeTab, stopWelcomePinWatcher, watchWelcomePinStatus, welcomePinWatchers };
