import { COPY, EXTERNAL_LINK, SHARE } from "../vendor/lucide.js";
import { SUPPORT_SURVEY_CHROME_STORE_URL, SUPPORT_SURVEY_FIREFOX_STORE_URL } from "./support-survey/constants.js";

const STORE_URLS = { chrome: SUPPORT_SURVEY_CHROME_STORE_URL, firefox: SUPPORT_SURVEY_FIREFOX_STORE_URL };

function iconButton(icon, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ec-recommend-icon-button";
  button.innerHTML = icon;
  button.setAttribute("aria-label", label);
  button.dataset.tooltip = label;
  return button;
}

function storeRow(label, url, strings, status) {
  const row = document.createElement("section");
  row.className = "ec-recommend-store-row";
  const name = document.createElement("span");
  name.className = "ec-recommend-store-name";
  name.textContent = label;
  const actions = document.createElement("div");
  actions.className = "ec-recommend-store-actions";
  const open = iconButton(EXTERNAL_LINK, strings.recommendOpenAction);
  open.addEventListener("click", () => window.open(url, "_blank", "noopener,noreferrer"));
  const copy = iconButton(COPY, strings.recommendCopyAction);
  copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(url); status.textContent = strings.recommendCopied; }
    catch { status.textContent = strings.recommendCopyFailed; }
  });
  const share = iconButton(SHARE, strings.recommendShareAction);
  share.addEventListener("click", async () => {
    if (typeof navigator.share !== "function") {
      try { await navigator.clipboard.writeText(url); status.textContent = strings.recommendCopied; }
      catch { status.textContent = strings.recommendShareFailed; }
      return;
    }
    try { await navigator.share({ title: "Element Copier", text: strings.recommendShareMessage, url }); }
    catch (error) { if (error?.name !== "AbortError") status.textContent = strings.recommendShareFailed; }
  });
  actions.append(open, copy, share);
  row.append(name, actions);
  return row;
}

function buildRecommendPanelBody(body, strings) {
  body.replaceChildren();
  const page = document.createElement("div");
  page.className = "ec-panel-page ec-panel-page--recommend";
  const title = document.createElement("h2");
  title.className = "ec-panel-page-title";
  title.textContent = strings.tabRecommend;
  const divider = document.createElement("div");
  divider.className = "dd-panel-divider ec-panel-page-divider";
  const intro = document.createElement("p");
  intro.className = "ec-recommend-intro";
  intro.textContent = strings.recommendIntro;
  const list = document.createElement("div");
  list.className = "ec-recommend-store-list";
  const status = document.createElement("span");
  status.className = "ec-recommend-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  list.append(storeRow("Chrome", STORE_URLS.chrome, strings, status), storeRow("Firefox", STORE_URLS.firefox, strings, status));
  page.append(title, divider, intro, list, status);
  body.append(page);
}

export { STORE_URLS, buildRecommendPanelBody };
