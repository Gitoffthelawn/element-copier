import { WELCOME_PIN_WATCH_CONFIG, WELCOME_TAB_CONFIG } from "./constants.js";
import { buildWelcomeData } from "./data.js";
import { ext } from "../api.js";
import { getLocale } from "../storage.js";
import { isActionOnToolbar } from "../pin.js";
import { openWelcomeTab, stopWelcomePinWatcher, watchWelcomePinStatus } from "./tab.js";

function stopWelcomePinWatcher2(tabId) {
  stopWelcomePinWatcher(tabId);
}

function watchWelcomePinStatus2(tabId) {
  watchWelcomePinStatus(tabId, WELCOME_PIN_WATCH_CONFIG);
}

async function showWelcome() {
  const locale = await getLocale();
  const manifest = ext.runtime.getManifest();
  const isPinned = await isActionOnToolbar(ext.action);
  await openWelcomeTab(
    WELCOME_TAB_CONFIG,
    buildWelcomeData(locale, manifest.name, { isPinned })
  );
}

export { showWelcome, stopWelcomePinWatcher2, watchWelcomePinStatus2 };
