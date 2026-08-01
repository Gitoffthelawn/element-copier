import { ext } from "./api.js";

function sendToBackground(msg) {
  void ext.runtime.sendMessage(msg).catch(() => {
  });
}

var STORAGE_KEY = "notificationSeconds";

var LOCALE_STORAGE_KEY = "locale";

var LOCALE_USER_SELECTED_KEY = "localeUserSelected";

var LOCALE_DETECT_VERSION_KEY = "localeDetectVersion";

var LOCALE_DETECT_VERSION = 1;

var START_HOTKEY_ENABLED_KEY = "startHotkeyEnabled";

var ESC_HOTKEY_ENABLED_KEY = "escHotkeyEnabled";

var ENABLED_FORMATS_KEY = "enabledFormats";

var DEVELOPER_TOOLS_ENABLED_KEY = "developerToolsEnabled";

var DARK_THEME_ENABLED_KEY = "darkThemeEnabled";

var CLIPBOARD_DEFAULT_FORMAT_KEY = "clipboardDefaultFormat";

var INLINE_IMAGES_KEY = "inlineImages";

var FRAME_LABEL_STYLE_KEY = "frameLabelStyle";

var COMPUTE_IMAGES_ENABLED_KEY = "computeImagesEnabled";

var DEFAULT_NOTIFICATION_SECONDS = 4;

export { CLIPBOARD_DEFAULT_FORMAT_KEY, COMPUTE_IMAGES_ENABLED_KEY, DARK_THEME_ENABLED_KEY, DEFAULT_NOTIFICATION_SECONDS, DEVELOPER_TOOLS_ENABLED_KEY, ENABLED_FORMATS_KEY, ESC_HOTKEY_ENABLED_KEY, FRAME_LABEL_STYLE_KEY, INLINE_IMAGES_KEY, LOCALE_DETECT_VERSION, LOCALE_DETECT_VERSION_KEY, LOCALE_STORAGE_KEY, LOCALE_USER_SELECTED_KEY, START_HOTKEY_ENABLED_KEY, STORAGE_KEY, sendToBackground };
