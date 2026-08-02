import { absolutizeElementUrls } from "../urls.js";
import { sanitizeMarkdownAltText } from "../../../vendor/turndown.js";

function absolutizeClipboardLinks(root2, baseHref) {
  if (!baseHref) return;
  absolutizeElementUrls(root2, baseHref);
}

function collapseWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function extractVisibleLinkText(anchor) {
  return collapseWhitespace(anchor.textContent ?? "");
}

function extractDescendantAltText(anchor) {
  for (const img of Array.from(anchor.querySelectorAll("img[alt]"))) {
    const alt = sanitizeMarkdownAltText(
      collapseWhitespace(img.getAttribute("alt") ?? "")
    );
    if (alt) return alt;
  }
  return "";
}

var CONTACT_ACTION_SCHEME_RE = /^(mailto|tel|sms|facetime|tg|whatsapp|skype|slack):/i;

function hrefToContactActionLabel(href) {
  const trimmed = href.trim();
  if (!CONTACT_ACTION_SCHEME_RE.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    let dest = "";
    if (url.hostname) {
      dest = url.hostname;
      if (url.pathname && url.pathname !== "/") {
        dest += url.pathname;
      }
    } else if (url.pathname && url.pathname !== "/") {
      dest = url.pathname.replace(/^\//, "");
    }
    if (url.search) dest += url.search;
    if (url.hash) dest += url.hash;
    if (dest) return dest;
  } catch {
  }
  const colon = trimmed.indexOf(":");
  return colon >= 0 ? trimmed.slice(colon + 1) : trimmed;
}

function hrefToDomainShorthand(href, baseHref) {
  const trimmed = href.trim();
  if (/^data:/i.test(trimmed)) return trimmed;
  const contactAction = hrefToContactActionLabel(trimmed);
  if (contactAction !== null) return contactAction;
  try {
    const url = new URL(href, baseHref || void 0);
    let host = url.hostname;
    if (host.startsWith("www.")) host = host.slice(4);
    const hasPath = url.pathname && url.pathname !== "/";
    const hasQuery = Boolean(url.search);
    if (!hasPath && !hasQuery) return host;
    return `${host}/...`;
  } catch {
    if (!trimmed) return "link";
    return trimmed.length > 40 ? `${trimmed.slice(0, 37)}...` : trimmed;
  }
}

function resolveLinkLabel(anchor, baseHref) {
  const text = extractVisibleLinkText(anchor);
  if (text) return text;
  const alt = extractDescendantAltText(anchor);
  if (alt) return alt;
  const href = anchor.getAttribute("href");
  if (href) return hrefToDomainShorthand(href, baseHref);
  return "";
}

function isImagePrimaryLink(anchor) {
  if (!anchor.querySelector("img")) return false;
  return !extractVisibleLinkText(anchor);
}

function trimImagePrimaryLinkMarkup(anchor) {
  const imgs = Array.from(anchor.querySelectorAll("img"));
  if (imgs.length === 0) return;
  anchor.replaceChildren(...imgs.map((img) => img.cloneNode(true)));
}

function normalizeClipboardLinks(root2, baseHref) {
  for (const anchor of Array.from(root2.querySelectorAll("a[href]"))) {
    if (!(anchor instanceof HTMLAnchorElement)) continue;
    if (isImagePrimaryLink(anchor)) {
      trimImagePrimaryLinkMarkup(anchor);
      continue;
    }
    const label = resolveLinkLabel(anchor, baseHref);
    if (!label) continue;
    anchor.textContent = sanitizeMarkdownAltText(label);
  }
}

export { CONTACT_ACTION_SCHEME_RE, absolutizeClipboardLinks, collapseWhitespace, extractDescendantAltText, extractVisibleLinkText, hrefToContactActionLabel, hrefToDomainShorthand, isImagePrimaryLink, normalizeClipboardLinks, resolveLinkLabel, trimImagePrimaryLinkMarkup };
