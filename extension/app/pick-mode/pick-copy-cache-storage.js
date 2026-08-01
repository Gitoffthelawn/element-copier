import { ext } from "../api.js";
import { isFormattedTextCacheStorable } from "../copy/formatted-text/cache.js";

var PICK_COPY_CACHE_STORAGE_KEY = "pickCopyCache";

var PICK_COPY_CACHE_INDEX_KEY = "pickCopyCacheFormats";

var PICK_COPY_META_STORAGE_KEY = "pickCopyMeta";

var pickCopyCachePresentSync = false;

function hasPickCopyCachePresentSync() {
  return pickCopyCachePresentSync;
}

function applyPickCopyCachePresence(record, index) {
  pickCopyCachePresentSync = record !== void 0 && Object.keys(record).length > 0 || Array.isArray(index) && index.length > 0;
}

function resolvePickCopyCacheStorageKey(formatId) {
  if (formatId === "markdownFile") return "markdown";
  if (formatId === "htmlFile") return "outerHTML";
  return formatId;
}

function isPickCopyCacheValueStorable(formatId, value, doc) {
  if (formatId === "text") {
    return isFormattedTextCacheStorable(value, doc);
  }
  return value.trim() !== "";
}

function isPickCopyFormatAvailable(formatId, record, doc) {
  if (!record) return false;
  const value = record[resolvePickCopyCacheStorageKey(formatId)];
  if (value === void 0) return false;
  if (formatId === "text") {
    return isFormattedTextCacheStorable(value, doc);
  }
  return true;
}

async function readPickCopyCacheFromStorage() {
  const data = await ext.storage.local.get(PICK_COPY_CACHE_STORAGE_KEY);
  const record = data[PICK_COPY_CACHE_STORAGE_KEY];
  if (!record || typeof record !== "object") return void 0;
  return record;
}

async function hasPickCopyCacheInStorage() {
  const record = await readPickCopyCacheFromStorage();
  const data = await ext.storage.local.get(PICK_COPY_CACHE_INDEX_KEY);
  applyPickCopyCachePresence(record, data[PICK_COPY_CACHE_INDEX_KEY]);
  return pickCopyCachePresentSync;
}

async function writePickCopyCacheIndex(formatIds) {
  if (formatIds.length === 0) {
    await ext.storage.local.remove(PICK_COPY_CACHE_INDEX_KEY);
    const record2 = await readPickCopyCacheFromStorage();
    applyPickCopyCachePresence(record2, void 0);
    return;
  }
  await ext.storage.local.set({ [PICK_COPY_CACHE_INDEX_KEY]: formatIds });
  const record = await readPickCopyCacheFromStorage();
  applyPickCopyCachePresence(record, formatIds);
}

async function writePickCopyCacheToStorage(entries, doc) {
  const record = {};
  for (const { key, value } of entries) {
    if (!isPickCopyCacheValueStorable(key, value, doc)) continue;
    record[key] = value;
  }
  if (Object.keys(record).length === 0) {
    await ext.storage.local.remove(PICK_COPY_CACHE_STORAGE_KEY);
    const data2 = await ext.storage.local.get(PICK_COPY_CACHE_INDEX_KEY);
    applyPickCopyCachePresence(void 0, data2[PICK_COPY_CACHE_INDEX_KEY]);
    return;
  }
  await ext.storage.local.set({ [PICK_COPY_CACHE_STORAGE_KEY]: record });
  const data = await ext.storage.local.get(PICK_COPY_CACHE_INDEX_KEY);
  applyPickCopyCachePresence(record, data[PICK_COPY_CACHE_INDEX_KEY]);
}

async function clearPickCopyCacheStorage() {
  await ext.storage.local.remove([
    PICK_COPY_CACHE_STORAGE_KEY,
    PICK_COPY_CACHE_INDEX_KEY,
    PICK_COPY_META_STORAGE_KEY
  ]);
  applyPickCopyCachePresence(void 0, void 0);
}

async function writePickCopyMetaToStorage(meta) {
  await ext.storage.local.set({ [PICK_COPY_META_STORAGE_KEY]: meta });
}

async function readPickCopyMetaFromStorage() {
  const data = await ext.storage.local.get(PICK_COPY_META_STORAGE_KEY);
  const meta = data[PICK_COPY_META_STORAGE_KEY];
  if (!meta || typeof meta !== "object") return void 0;
  const { tagName, hostname } = meta;
  if (typeof tagName !== "string" || typeof hostname !== "string") return void 0;
  return { tagName, hostname };
}

async function refreshPickCopyCachePresenceSync() {
  return hasPickCopyCacheInStorage();
}

async function getPickCopyTextFromStorage(formatId) {
  const record = await readPickCopyCacheFromStorage();
  if (!record) return void 0;
  return record[resolvePickCopyCacheStorageKey(formatId)];
}

export { PICK_COPY_CACHE_INDEX_KEY, PICK_COPY_CACHE_STORAGE_KEY, PICK_COPY_META_STORAGE_KEY, applyPickCopyCachePresence, clearPickCopyCacheStorage, getPickCopyTextFromStorage, hasPickCopyCacheInStorage, hasPickCopyCachePresentSync, isPickCopyCacheValueStorable, isPickCopyFormatAvailable, pickCopyCachePresentSync, readPickCopyCacheFromStorage, readPickCopyMetaFromStorage, refreshPickCopyCachePresenceSync, resolvePickCopyCacheStorageKey, writePickCopyCacheIndex, writePickCopyCacheToStorage, writePickCopyMetaToStorage };
