var INLINE_IMAGE_SRC_RE = /^(data:|blob:)/i;

function isInlineImageSrc(src) {
  return INLINE_IMAGE_SRC_RE.test(src.trim());
}

function resolveMaterializedImageSrc(raw, doc) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  if (isInlineImageSrc(trimmed)) return trimmed;
  try {
    return new URL(trimmed, doc.baseURI).href;
  } catch {
    return null;
  }
}

export { INLINE_IMAGE_SRC_RE, isInlineImageSrc, resolveMaterializedImageSrc };
