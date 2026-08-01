var RTL_LOCALES = /* @__PURE__ */ new Set(["ar"]);

function isRtlLocale(locale) {
  return RTL_LOCALES.has(locale);
}

export { RTL_LOCALES, isRtlLocale };
