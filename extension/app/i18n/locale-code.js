var CHINESE_UI_LOCALE = "zh_CN";

function normalizeLocaleCode(code) {
  if (code === "zh") return CHINESE_UI_LOCALE;
  return code;
}

function localeToHtmlLang(locale) {
  return locale.replace(/_/g, "-");
}

export { CHINESE_UI_LOCALE, localeToHtmlLang, normalizeLocaleCode };
