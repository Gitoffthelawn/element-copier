import { ESC_HOTKEY_ENABLED_KEY, START_HOTKEY_ENABLED_KEY } from "../messages.js";
import { ext } from "../api.js";

function readBooleanSetting(data, key) {
  return data[key] !== false;
}

async function getStartHotkeyEnabled() {
  const data = await ext.storage.local.get(START_HOTKEY_ENABLED_KEY);
  return readBooleanSetting(data, START_HOTKEY_ENABLED_KEY);
}

async function getEscHotkeyEnabled() {
  const data = await ext.storage.local.get(ESC_HOTKEY_ENABLED_KEY);
  return readBooleanSetting(data, ESC_HOTKEY_ENABLED_KEY);
}

export { getEscHotkeyEnabled, getStartHotkeyEnabled, readBooleanSetting };
