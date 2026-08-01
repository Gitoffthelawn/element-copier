import { isPanelPopupPage, resolvePanelPageInitialTab2 } from "../panel-popup/page.js";
import { isPanelTabMode } from "../panel-tab/index.js";
import { mountPanelTab } from "./mount.js";

async function bootstrapPanelTabPageIfNeeded() {
  if (!isPanelPopupPage(location.href)) return;
  if (!isPanelTabMode()) return;
  const tab = await resolvePanelPageInitialTab2();
  await mountPanelTab(tab);
}

export { bootstrapPanelTabPageIfNeeded };
