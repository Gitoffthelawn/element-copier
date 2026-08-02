import { DARK_THEME_ENABLED_KEY } from "../messages.js";
import { ext } from "../api.js";

async function getDarkThemeEnabled() {
  const data = await ext.storage.local.get(DARK_THEME_ENABLED_KEY);
  return data[DARK_THEME_ENABLED_KEY] === true;
}

async function setDarkThemeEnabled(enabled) {
  await ext.storage.local.set({ [DARK_THEME_ENABLED_KEY]: enabled });
}

export { getDarkThemeEnabled, setDarkThemeEnabled };
