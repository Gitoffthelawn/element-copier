import { ext } from "../api.js";

function resolveInitialPanelTab(sessionTab, queryTab, defaultTab, validTabs) {
  if (typeof sessionTab === "string" && validTabs.includes(sessionTab)) {
    return sessionTab;
  }
  if (typeof queryTab === "string" && validTabs.includes(queryTab)) {
    return queryTab;
  }
  return defaultTab;
}

async function resolvePanelPageInitialTab(config) {
  const { [config.sessionTabKey]: sessionTab } = await ext.storage.session.get(
    config.sessionTabKey
  );
  await ext.storage.session.remove(config.sessionTabKey);
  const tabParam = new URLSearchParams(location.search).get(
    config.tabQueryParam ?? "tab"
  );
  return resolveInitialPanelTab(sessionTab, tabParam, config.defaultTab, config.validTabs);
}

export { resolveInitialPanelTab, resolvePanelPageInitialTab };
