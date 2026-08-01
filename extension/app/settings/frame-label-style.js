import { FRAME_LABEL_STYLE_KEY } from "../messages.js";
import { ext } from "../api.js";

var DEFAULT_FRAME_LABEL_STYLE = "click-to-copy";

var FRAME_LABEL_STYLES = [
  "none",
  "click-to-copy",
  "tag-id-class",
  "selector",
  "full-xpath"
];

function normalizeFrameLabelStyle(raw) {
  return FRAME_LABEL_STYLES.includes(raw) ? raw : DEFAULT_FRAME_LABEL_STYLE;
}

async function getFrameLabelStyle() {
  const data = await ext.storage.local.get(FRAME_LABEL_STYLE_KEY);
  return normalizeFrameLabelStyle(data[FRAME_LABEL_STYLE_KEY]);
}

async function setFrameLabelStyle(style) {
  await ext.storage.local.set({ [FRAME_LABEL_STYLE_KEY]: style });
}

export { DEFAULT_FRAME_LABEL_STYLE, FRAME_LABEL_STYLES, getFrameLabelStyle, normalizeFrameLabelStyle, setFrameLabelStyle };
