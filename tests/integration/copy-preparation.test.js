"use strict";

import { prepareElementForCopy } from "../../extension/lib/our/copy/cleanup/index.js";

const { assert, assertEqual, test } = TestHarness;

test("copy preparation removes unsafe and non-content nodes while preserving exportable content", async () => {
  const source = document.createElement("article");
  source.innerHTML = `
    <!-- analytics marker -->
    <noscript>Fallback tracking pixel</noscript>
    <p onclick="bad()" contenteditable="true">  Order   <strong>confirmed</strong>  </p>
    <script>window.shouldNotRun = true;</script>
    <a href="/orders/42">  View   order  </a>
  `;
  document.body.append(source);

  const prepared = await prepareElementForCopy(source, { baseHref: "https://shop.example/account/" });

  assertEqual(prepared.querySelector("noscript"), null);
  assertEqual(prepared.querySelector("script"), null);
  assertEqual(prepared.querySelector("[onclick]"), null);
  assertEqual(prepared.querySelector("[contenteditable]"), null);
  assertEqual(prepared.innerHTML.includes("analytics marker"), false);
  assertEqual(prepared.querySelector("p").textContent, " Order confirmed ");
  assertEqual(prepared.querySelector("a").getAttribute("href"), "https://shop.example/orders/42");
  assertEqual(prepared.querySelector("a").textContent, "View order");
  source.remove();
});

test("copy preparation keeps linked image markup intact for Markdown conversion", async () => {
  const source = document.createElement("div");
  source.innerHTML = '<a href="/profile"><img src="https://example.test/avatar.png" alt="Account avatar"></a>';
  document.body.append(source);

  const prepared = await prepareElementForCopy(source, { baseHref: "https://example.test/settings" });
  const anchor = prepared.querySelector("a");

  assert(anchor, "The image link must remain a link.");
  assertEqual(anchor.children.length, 1);
  assertEqual(anchor.firstElementChild.tagName, "IMG");
  assertEqual(anchor.getAttribute("href"), "https://example.test/profile");
  assertEqual(anchor.firstElementChild.getAttribute("src"), "https://example.test/avatar.png");
  source.remove();
});
