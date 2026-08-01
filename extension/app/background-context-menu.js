import { ext } from "../lib/our/api.js";
import { getLocale } from "./storage.js";
import { hasPickCopyCacheInStorage } from "./pick-mode/pick-copy-cache-storage.js";
import { isRtlLocale } from "../lib/our/i18n/rtl.js";
import { t } from "./i18n/strings.js";

var CONTEXT_MENU_START = "element-copier-start";

var CONTEXT_MENU_COPIED = "element-copier-copied";

var CONTEXT_MENU_SETTINGS = "element-copier-settings";

var CONTEXT_MENU_ABOUT = "element-copier-about";

var ACTION_MENU_EMOJI = {
  start: "▶️",
  copied: "🗂️",
  settings: "⚙️",
  about: "ℹ️"
};

var CONTEXT_MENU_START_ITEM = {
  id: CONTEXT_MENU_START,
  tab: "start",
  emoji: ACTION_MENU_EMOJI.start,
  title: (strings) => strings.titleSettings
};

var CONTEXT_MENU_COPIED_ITEM = {
  id: CONTEXT_MENU_COPIED,
  tab: "copied",
  emoji: ACTION_MENU_EMOJI.copied,
  title: (strings) => strings.tabCopied
};

var CONTEXT_MENU_SECONDARY_ITEMS = [
  {
    id: CONTEXT_MENU_SETTINGS,
    tab: "settings",
    emoji: ACTION_MENU_EMOJI.settings,
    title: (strings) => strings.pageSettingsTitle
  },
  {
    id: CONTEXT_MENU_ABOUT,
    tab: "about",
    emoji: ACTION_MENU_EMOJI.about,
    title: (strings) => strings.tabAbout
  }
];

var ensureContextMenuChain = Promise.resolve();

async function createContextMenuItem(props) {
  try {
    await ext.contextMenus.create(props);
  } catch (err) {
    console.error("[Element Copier] contextMenus.create failed:", err, props);
  }
}

function actionMenuTitle(title, emoji, locale) {
  return isRtlLocale(locale) ? `${title} ${emoji}` : `${emoji} ${title}`;
}

async function ensureContextMenu() {
  ensureContextMenuChain = ensureContextMenuChain.then(async () => {
    const locale = await getLocale();
    const strings = t(locale);
    try {
      await ext.contextMenus.removeAll();
    } catch (err) {
      console.error("[Element Copier] contextMenus.removeAll failed:", err);
    }
    const hasCache = await hasPickCopyCacheInStorage();
    const primaryItem = hasCache ? CONTEXT_MENU_COPIED_ITEM : CONTEXT_MENU_START_ITEM;
    const contextMenuItems = [primaryItem, ...CONTEXT_MENU_SECONDARY_ITEMS];
    for (const item of contextMenuItems) {
      await createContextMenuItem({
        id: item.id,
        title: actionMenuTitle(item.title(strings), item.emoji, locale),
        contexts: ["action"]
      });
    }
  });
  await ensureContextMenuChain;
}

function findContextMenuTab(menuItemId) {
  if (menuItemId === CONTEXT_MENU_START) return "start";
  if (menuItemId === CONTEXT_MENU_COPIED) return "copied";
  return CONTEXT_MENU_SECONDARY_ITEMS.find((item) => item.id === menuItemId)?.tab;
}

export { ACTION_MENU_EMOJI, CONTEXT_MENU_ABOUT, CONTEXT_MENU_COPIED, CONTEXT_MENU_COPIED_ITEM, CONTEXT_MENU_SECONDARY_ITEMS, CONTEXT_MENU_SETTINGS, CONTEXT_MENU_START, CONTEXT_MENU_START_ITEM, actionMenuTitle, createContextMenuItem, ensureContextMenu, ensureContextMenuChain, findContextMenuTab };
