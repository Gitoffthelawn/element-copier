import { CLIPBOARD_DEFAULT_FORMAT_KEY, COMPUTE_IMAGES_ENABLED_KEY, DEVELOPER_TOOLS_ENABLED_KEY, ENABLED_FORMATS_KEY, FRAME_LABEL_STYLE_KEY, INLINE_IMAGES_KEY, LOCALE_STORAGE_KEY } from "../messages.js";
import { DEFAULT_FRAME_LABEL_STYLE, getFrameLabelStyle } from "./frame-label-style.js";
import { DEFAULT_INLINE_IMAGES_MODE, getInlineImagesMode } from "./inline-images.js";
import { defaultEnabledFormats, ensureDefaultActionAllowsComputeImages, getEnabledFormats, isActiveDefaultAction } from "./format-settings.js";
import { ext } from "../api.js";
import { getLocale } from "../storage.js";
import { t } from "../i18n/strings.js";

var cachedEnabledFormats = defaultEnabledFormats();

var cachedDefaultAction = null;

var cachedInlineImagesMode = DEFAULT_INLINE_IMAGES_MODE;

var cachedFrameLabelStyle = DEFAULT_FRAME_LABEL_STYLE;

var cachedFrameClickToCopyLabel = t("en").settingsFrameLabelClickToCopy;

var cachedPickParentContextMenuTitle = t("en").pickParentContextMenuTitle;

var bound = false;

var frameLabelStyleChangeListeners = /* @__PURE__ */ new Set();

function getCachedEnabledFormats() {
  return cachedEnabledFormats;
}

function getCachedDefaultAction() {
  return cachedDefaultAction;
}

function getCachedInlineImagesMode() {
  return cachedInlineImagesMode;
}

function getCachedFrameLabelStyle() {
  return cachedFrameLabelStyle;
}

function getCachedFrameClickToCopyLabel() {
  return cachedFrameClickToCopyLabel;
}

function getCachedPickParentContextMenuTitle() {
  return cachedPickParentContextMenuTitle;
}

function subscribeFrameLabelStyleChange(listener) {
  frameLabelStyleChangeListeners.add(listener);
  return () => frameLabelStyleChangeListeners.delete(listener);
}

function shouldRefreshFrameLabel(previousStyle, previousClickToCopyLabel) {
  if (previousStyle !== cachedFrameLabelStyle) return true;
  if (cachedFrameLabelStyle !== "click-to-copy") return false;
  return previousClickToCopyLabel !== cachedFrameClickToCopyLabel;
}

async function refreshFormatSettingsCache() {
  const previousFrameLabelStyle = cachedFrameLabelStyle;
  const previousClickToCopyLabel = cachedFrameClickToCopyLabel;
  cachedEnabledFormats = await getEnabledFormats();
  const stored = await ensureDefaultActionAllowsComputeImages();
  cachedDefaultAction = isActiveDefaultAction(stored) ? stored : null;
  cachedInlineImagesMode = await getInlineImagesMode();
  cachedFrameLabelStyle = await getFrameLabelStyle();
  const locale = await getLocale();
  cachedFrameClickToCopyLabel = t(locale).settingsFrameLabelClickToCopy;
  cachedPickParentContextMenuTitle = t(locale).pickParentContextMenuTitle;
  if (shouldRefreshFrameLabel(previousFrameLabelStyle, previousClickToCopyLabel)) {
    for (const listener of frameLabelStyleChangeListeners) {
      listener();
    }
  }
}

function bindFormatSettingsCache() {
  if (bound) return;
  bound = true;
  void refreshFormatSettingsCache();
  ext.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes[DEVELOPER_TOOLS_ENABLED_KEY] || changes[ENABLED_FORMATS_KEY] || changes[COMPUTE_IMAGES_ENABLED_KEY] || changes[CLIPBOARD_DEFAULT_FORMAT_KEY] || changes[INLINE_IMAGES_KEY] || changes[FRAME_LABEL_STYLE_KEY] || changes[LOCALE_STORAGE_KEY]) {
      void refreshFormatSettingsCache();
    }
  });
}

export { bindFormatSettingsCache, bound, cachedDefaultAction, cachedEnabledFormats, cachedFrameClickToCopyLabel, cachedFrameLabelStyle, cachedInlineImagesMode, frameLabelStyleChangeListeners, getCachedDefaultAction, getCachedEnabledFormats, getCachedFrameClickToCopyLabel, getCachedFrameLabelStyle, getCachedInlineImagesMode, getCachedPickParentContextMenuTitle, refreshFormatSettingsCache, shouldRefreshFrameLabel, subscribeFrameLabelStyleChange };
