import { INLINE_IMAGES_KEY } from "../messages.js";
import { ext } from "../api.js";

var DEFAULT_INLINE_IMAGES_MODE = "remove-small";

var INLINE_IMAGES_MODES = [
  "all",
  "remove-large",
  "remove-small",
  "remove-all"
];

function normalizeInlineImagesMode(raw) {
  return INLINE_IMAGES_MODES.includes(raw) ? raw : DEFAULT_INLINE_IMAGES_MODE;
}

async function getInlineImagesMode() {
  const data = await ext.storage.local.get(INLINE_IMAGES_KEY);
  return normalizeInlineImagesMode(data[INLINE_IMAGES_KEY]);
}

async function setInlineImagesMode(mode) {
  await ext.storage.local.set({ [INLINE_IMAGES_KEY]: mode });
}

export { DEFAULT_INLINE_IMAGES_MODE, INLINE_IMAGES_MODES, getInlineImagesMode, normalizeInlineImagesMode, setInlineImagesMode };
