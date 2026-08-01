import { ext } from "../api.js";

function fallbackLanguageTags() {
  if (typeof navigator !== "undefined" && navigator.languages?.length) {
    return [...navigator.languages];
  }
  try {
    const ui = ext.i18n?.getUILanguage?.();
    return ui ? [ui] : [];
  } catch {
    return [];
  }
}

function pickLanguageTags(languages) {
  return languages?.length ? [...languages] : fallbackLanguageTags();
}

function getAcceptLanguageTags() {
  return new Promise((resolve) => {
    const getAccept = ext.i18n?.getAcceptLanguages;
    if (typeof getAccept !== "function") {
      resolve(fallbackLanguageTags());
      return;
    }
    try {
      const maybePromise = getAccept((languages) => resolve(pickLanguageTags(languages)));
      if (maybePromise && typeof maybePromise.then === "function") {
        void maybePromise
          .then((languages) => resolve(pickLanguageTags(languages)))
          .catch(() => resolve(fallbackLanguageTags()));
      }
    } catch {
      resolve(fallbackLanguageTags());
    }
  });
}

async function detectLocale(mapLanguageTag2, fallbackLocale) {
  const tags = await getAcceptLanguageTags();
  const seen = new Set();
  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const mapped = mapLanguageTag2(tag);
    if (mapped) return mapped;
  }
  return fallbackLocale;
}

function mapLanguageTag(tag) {
  const base = tag.trim().toLowerCase().replace(/_/g, "-").split("-")[0];
  if (base === "en") return "en";
  return null;
}

function detectLocale2() {
  return detectLocale(mapLanguageTag, "en");
}

export { detectLocale, detectLocale2, fallbackLanguageTags, getAcceptLanguageTags, mapLanguageTag, pickLanguageTags };
