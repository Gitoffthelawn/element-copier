import { PROBE_DOCUMENT_OPERABILITY } from "./content-probe.js";
import { ext } from "../api.js";
import { probeDocumentOperability } from "./probe.js";

function scriptingTarget(tabId, frameId) {
  return frameId !== void 0 && frameId !== 0 ? { tabId, frameIds: [frameId] } : { tabId };
}

function messageOptions(frameId) {
  return frameId !== void 0 && frameId !== 0 ? { frameId } : void 0;
}

async function canOperateOnTab(tabId, frameId) {
  try {
    const options = messageOptions(frameId);
    const response = options === void 0 ? await ext.tabs.sendMessage(tabId, { type: PROBE_DOCUMENT_OPERABILITY }) : await ext.tabs.sendMessage(
      tabId,
      { type: PROBE_DOCUMENT_OPERABILITY },
      options
    );
    if (response === true) return true;
    if (response === false) return false;
  } catch {
  }
  try {
    const [result] = await ext.scripting.executeScript({
      target: scriptingTarget(tabId, frameId),
      func: probeDocumentOperability
    });
    return result?.result === true;
  } catch {
    return false;
  }
}

export { canOperateOnTab, messageOptions, scriptingTarget };
