import { hasNonWhitespaceTextInClipboardHtml } from "./plain.js";

function serializeFormattedTextCache(payload) {
  return JSON.stringify(payload);
}

function parseFormattedTextCache(serialized) {
  try {
    const parsed = JSON.parse(serialized);
    if (typeof parsed === "object" && parsed !== null && typeof parsed.html === "string") {
      return { html: parsed.html };
    }
  } catch {
  }
  return null;
}

function isFormattedTextCacheStorable(serialized, doc) {
  const payload = parseFormattedTextCache(serialized);
  if (!payload?.html?.trim()) return false;
  if (!doc) return false;
  return hasNonWhitespaceTextInClipboardHtml(payload.html, doc);
}

export { isFormattedTextCacheStorable, parseFormattedTextCache, serializeFormattedTextCache };
