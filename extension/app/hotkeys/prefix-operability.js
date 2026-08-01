import { PREFIX_HINT_BLOCKED, PREFIX_HINT_CAN_SHOW } from "./prefix-hint-messages.js";
import { ext } from "../api.js";

async function queryPrefixHintCanShowFromBackground() {
  try {
    return await ext.runtime.sendMessage({ type: PREFIX_HINT_CAN_SHOW }) === true;
  } catch {
    return false;
  }
}

function notifyPrefixHintBlockedOnBackground() {
  void ext.runtime.sendMessage({ type: PREFIX_HINT_BLOCKED }).catch(() => {
  });
}

var operabilityListenersRegistered = false;

function registerPrefixHintOperabilityListeners(handlers) {
  if (operabilityListenersRegistered) return;
  operabilityListenersRegistered = true;
  ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabId = sender.tab?.id;
    if (tabId === void 0) return;
    const msg = message;
    if (msg.type === PREFIX_HINT_CAN_SHOW) {
      void handlers.canOperateOnTab(tabId).then((ok) => {
        sendResponse(ok);
      });
      return true;
    }
    if (msg.type === PREFIX_HINT_BLOCKED) {
      void handlers.onBlockedOnTab?.(tabId, sender.tab?.windowId);
    }
  });
}

export { notifyPrefixHintBlockedOnBackground, operabilityListenersRegistered, queryPrefixHintCanShowFromBackground, registerPrefixHintOperabilityListeners };
