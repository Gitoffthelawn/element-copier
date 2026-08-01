import { COMPUTE_IMAGES_ENABLED_KEY } from "../messages.js";
import { ext } from "../api.js";

var COMPUTE_IMAGES_FORMAT_IDS = ["png", "jpeg"];

function defaultComputeFormatsSettings() {
  return {
    computeImages: true
  };
}

function isComputeControlledFormat(formatId) {
  return COMPUTE_IMAGES_FORMAT_IDS.includes(formatId);
}

function isFormatEnabledByComputeSettings(formatId, settings) {
  if (COMPUTE_IMAGES_FORMAT_IDS.includes(formatId)) return settings.computeImages;
  return true;
}

function readStoredBoolean(raw, fallback) {
  return typeof raw === "boolean" ? raw : fallback;
}

async function getComputeFormatsSettings() {
  const defaults = defaultComputeFormatsSettings();
  const data = await ext.storage.local.get(COMPUTE_IMAGES_ENABLED_KEY);
  return {
    computeImages: readStoredBoolean(data[COMPUTE_IMAGES_ENABLED_KEY], defaults.computeImages)
  };
}

async function setComputeImagesEnabled(enabled) {
  await ext.storage.local.set({ [COMPUTE_IMAGES_ENABLED_KEY]: enabled });
}

export { COMPUTE_IMAGES_FORMAT_IDS, defaultComputeFormatsSettings, getComputeFormatsSettings, isComputeControlledFormat, isFormatEnabledByComputeSettings, readStoredBoolean, setComputeImagesEnabled };
