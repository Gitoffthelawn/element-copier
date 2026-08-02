import { PANEL_SESSION_PORT_NAME } from "./constants.js";
import { ext } from "../api.js";
import { sendToBackground } from "../messages.js";

function notifyPanelTabChanged(tab) {
  sendToBackground({ type: "PANEL_TAB_CHANGED", tab });
}

function notifyStartPickMode() {
  sendToBackground({ type: "REQUEST_START_PICK_MODE" });
}

function notifyCopyPage() {
  sendToBackground({ type: "REQUEST_COPY_PAGE" });
}

function notifyPanelClosed() {
  sendToBackground({ type: "PANEL_CLOSED" });
}

function bindPanelSessionPort() {
  ext.runtime.connect({ name: PANEL_SESSION_PORT_NAME });
}

export { bindPanelSessionPort, notifyCopyPage, notifyPanelClosed, notifyPanelTabChanged, notifyStartPickMode };
