import { ext } from "../api.js";
import { normalizeCopyFormatId } from "../formats/definitions.js";

var LAST_COPIED_FORMAT_KEY = "lastCopiedFormat";

var LAST_DOWNLOADED_FORMAT_KEY = "lastDownloadedFormat";

var LAST_COPIED_PANEL_ACTION_KEY = "lastCopiedPanelAction";

var COPIED_PANEL_SHOW_STATUS_KEY = "copiedPanelShowStatus";

async function getLastCopiedFormat() {
  const data = await ext.storage.session.get(LAST_COPIED_FORMAT_KEY);
  const raw = data[LAST_COPIED_FORMAT_KEY];
  return normalizeCopyFormatId(raw) ?? null;
}

async function getLastDownloadedFormat() {
  const data = await ext.storage.session.get(LAST_DOWNLOADED_FORMAT_KEY);
  const raw = data[LAST_DOWNLOADED_FORMAT_KEY];
  return normalizeCopyFormatId(raw) ?? null;
}

async function getLastCopiedPanelAction() {
  const data = await ext.storage.session.get(LAST_COPIED_PANEL_ACTION_KEY);
  const raw = data[LAST_COPIED_PANEL_ACTION_KEY];
  if (raw === "copied" || raw === "saved") return raw;
  return null;
}

async function setLastCopiedFormat(formatId) {
  if (formatId === null) {
    await ext.storage.session.remove(LAST_COPIED_FORMAT_KEY);
    await ext.storage.session.remove(LAST_COPIED_PANEL_ACTION_KEY);
    return;
  }
  await ext.storage.session.set({
    [LAST_COPIED_FORMAT_KEY]: formatId,
    [LAST_COPIED_PANEL_ACTION_KEY]: "copied"
  });
}

async function setLastDownloadedFormat(formatId) {
  await ext.storage.session.set({
    [LAST_DOWNLOADED_FORMAT_KEY]: formatId,
    [LAST_COPIED_PANEL_ACTION_KEY]: "saved"
  });
}

async function markCopiedPanelShowStatus() {
  await ext.storage.session.set({ [COPIED_PANEL_SHOW_STATUS_KEY]: true });
}

async function shouldShowCopiedPanelStatus() {
  const data = await ext.storage.session.get(COPIED_PANEL_SHOW_STATUS_KEY);
  return data[COPIED_PANEL_SHOW_STATUS_KEY] === true;
}

function resolveCopiedPanelSelection(lastAction, lastCopiedFormatId, lastDownloadedFormatId, defaultAction = null) {
  if (lastAction === "saved") {
    return lastDownloadedFormatId ? { formatId: lastDownloadedFormatId, action: "download" } : null;
  }
  if (lastAction === "copied" && lastCopiedFormatId) {
    return { formatId: lastCopiedFormatId, action: "copy" };
  }
  return defaultAction ? { formatId: defaultAction.formatId, action: defaultAction.action } : null;
}

async function clearCopiedPanelShowStatus() {
  await ext.storage.session.remove(COPIED_PANEL_SHOW_STATUS_KEY);
}

export { COPIED_PANEL_SHOW_STATUS_KEY, LAST_COPIED_FORMAT_KEY, LAST_COPIED_PANEL_ACTION_KEY, LAST_DOWNLOADED_FORMAT_KEY, clearCopiedPanelShowStatus, getLastCopiedFormat, getLastCopiedPanelAction, getLastDownloadedFormat, markCopiedPanelShowStatus, resolveCopiedPanelSelection, setLastCopiedFormat, setLastDownloadedFormat, shouldShowCopiedPanelStatus };
