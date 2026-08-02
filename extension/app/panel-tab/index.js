var PANEL_TAB_MODE_PARAM = "mode";

var PANEL_TAB_MODE_VALUE = "tab";

function isPanelTabMode(modeParam = PANEL_TAB_MODE_PARAM, modeValue = PANEL_TAB_MODE_VALUE, search = location.search) {
  return new URLSearchParams(search).get(modeParam) === modeValue;
}

function applyPanelTabPageLayout(pageClass) {
  document.documentElement.classList.add(pageClass);
}

export { PANEL_TAB_MODE_PARAM, PANEL_TAB_MODE_VALUE, applyPanelTabPageLayout, isPanelTabMode };
