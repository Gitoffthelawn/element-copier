"use strict";

import { getQaDetails } from "../../extension/app/copy/extract.js";
import { normalizeCopyFormatId } from "../../extension/app/formats/definitions.js";
import { parseFormattedTextCache, isFormattedTextCacheStorable } from "../../extension/lib/our/copy/formatted-text/cache.js";
import { derivePlainFromClipboardHtml } from "../../extension/lib/our/copy/formatted-text/plain.js";
import { applyInlineImagePolicy } from "../../extension/lib/our/copy/cleanup/inline-images.js";

const { assert, assertEqual, test } = TestHarness;

test("QA details include useful attributes but exclude page content and sensitive URL attributes", () => {
  const element = document.createElement("button");
  element.setAttribute("type", "button");
  element.setAttribute("aria-label", "Pay now");
  element.setAttribute("data-order-id", "42");
  element.setAttribute("href", "https://private.example/token");
  element.setAttribute("value", "4111 1111 1111 1111");
  element.setAttribute("onclick", "steal()");

  const details = getQaDetails(element);

  assert(details.includes('type="button"'));
  assert(details.includes('aria-label="Pay now"'));
  assert(details.includes('data-order-id="42"'));
  assert(!details.includes("href="), "QA details must not expose URLs.");
  assert(!details.includes("value="), "QA details must not expose form values.");
  assert(!details.includes("onclick="), "QA details must not expose event handlers.");
});

test("formatted text cache rejects damaged, empty, and image-less markup but keeps meaningful content", () => {
  assertEqual(parseFormattedTextCache("not json"), null);
  assertEqual(parseFormattedTextCache('{"html":42}'), null);
  assert(!isFormattedTextCacheStorable('{"html":"   "}', document));
  assert(!isFormattedTextCacheStorable('{"html":"<span> </span>"}', document));
  assert(isFormattedTextCacheStorable('{"html":"<p>Order confirmed</p>"}', document));
  assert(isFormattedTextCacheStorable('{"html":"<img src=\\"data:image/png;base64,AA==\\">"}', document));
});

test("plain-text derivation preserves table cells and uses image alt text when no text exists", () => {
  assertEqual(
    derivePlainFromClipboardHtml("<table><tr><th>Item</th><th>Price</th></tr><tr><td>Tea</td><td>$5</td></tr></table>", document),
    "Item\tPrice\nTea\t$5"
  );
  assertEqual(
    derivePlainFromClipboardHtml("<!--StartFragment--><img src=\"x.png\" alt=\"Product photo\"><!--EndFragment-->", document),
    "Product photo"
  );
});

test("inline image setting removes only the data URLs prohibited by the selected policy", () => {
  const root = document.createElement("div");
  const shortDataUrl = "data:image/png;base64,AA==";
  const longDataUrl = `data:image/png;base64,${"A".repeat(2100)}`;
  root.innerHTML = `<img id="short" src="${shortDataUrl}"><img id="long" src="${longDataUrl}">`;

  applyInlineImagePolicy(root, "remove-large");

  assertEqual(root.querySelector("#short").getAttribute("src"), shortDataUrl);
  assertEqual(root.querySelector("#long").getAttribute("src"), null);
});

test("format id normalization retains supported ids and maps the documented legacy name", () => {
  assertEqual(normalizeCopyFormatId("markdown"), "markdown");
  assertEqual(normalizeCopyFormatId("declaredStyles"), "styles");
  assertEqual(normalizeCopyFormatId("unsupported-format"), undefined);
});
