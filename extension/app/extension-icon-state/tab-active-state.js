var tabActive = /* @__PURE__ */ new Map();

function getTabActiveState(tabId) {
  return tabActive.get(tabId) ?? false;
}

function setTabActiveState(tabId, active) {
  tabActive.set(tabId, active);
}

function deleteTabActiveState(tabId) {
  tabActive.delete(tabId);
}

function clearTabActiveState(tabId) {
  tabActive.set(tabId, false);
}

export { clearTabActiveState, deleteTabActiveState, getTabActiveState, setTabActiveState, tabActive };
