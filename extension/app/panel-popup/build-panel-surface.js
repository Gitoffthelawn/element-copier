import { PANEL_POPUP_HOST_ATTR } from "./constants.js";
import { PANEL_TITLE } from "../brand.js";
import { createPanelDivider, createPanelHeader } from "../panel-header/header.js";
import { createPanelMenu } from "./panel-menu.js";
import { getDarkThemeEnabled } from "../settings/theme-settings.js";
import { hasPickCopyCacheInStorage } from "../pick-mode/pick-copy-cache-storage.js";
import { isRtlLocale } from "../i18n/rtl.js";
import { localeToHtmlLang } from "../i18n/locale-code.js";
import { t } from "../i18n/strings.js";
import { toolbarWelcomeIconSvg } from "../icons.js";

var PANEL_DARK_CLASS = "ec-panel--dark";

async function createPanelSurface(locale, surface) {
  const panelRoot = document.createElement("div");
  panelRoot.className = "ec-panel";
  if (surface === "popup") {
    panelRoot.classList.add("ec-panel--surface-popup");
  }
  panelRoot.lang = localeToHtmlLang(locale);
  panelRoot.dir = isRtlLocale(locale) ? "rtl" : "ltr";
  const strings = t(locale);
  const header = createPanelHeader({
    title: PANEL_TITLE,
    subtitle: strings.panelSubtitle,
    logoSvg: toolbarWelcomeIconSvg()
  });
  const body = document.createElement("div");
  body.className = "ec-panel-body";
  const topDivider = createPanelDivider();
  let menu = null;
  if (surface === "popup") {
    const hasCache = await hasPickCopyCacheInStorage();
    menu = createPanelMenu(strings, hasCache);
    const main = document.createElement("div");
    main.className = "ec-panel-main";
    const content = document.createElement("div");
    content.className = "ec-panel-content";
    content.append(topDivider, body);
    main.append(menu.root, content);
    panelRoot.append(header, main);
  } else {
    panelRoot.append(header, topDivider, body);
  }
  panelRoot.setAttribute(PANEL_POPUP_HOST_ATTR, "true");
  if (await getDarkThemeEnabled()) {
    panelRoot.classList.add(PANEL_DARK_CLASS);
  }
  return { panelRoot, body, menu };
}

export { PANEL_DARK_CLASS, createPanelSurface };
