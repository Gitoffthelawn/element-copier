"use strict";

import { createHighlightUiClasses } from "../../extension/lib/our/highlight/classes.js";
import { pickElementUnderCursor } from "../../extension/lib/our/element-under-cursor.js";

const { assertEqual, test } = TestHarness;

test("highlight UI classes use a stable prefixed namespace", () => {
  const classes = createHighlightUiClasses("ec");
  assertEqual(classes.highlightTarget, "ec-highlight");
  assertEqual(classes.highlightFrame, "ec-highlight-frame");
  assertEqual(classes.elementLabel, "ec-element-label");
});

test("pick mode resolves the element under the pointer", () => {
  const fixture = document.createElement("section");
  fixture.style.cssText = "position: fixed; left: 16px; top: 16px; width: 160px; height: 80px;";
  fixture.innerHTML = '<button type="button" style="width: 120px; height: 40px;">Copy me</button>';
  document.body.append(fixture);

  const button = fixture.querySelector("button");
  const rect = button.getBoundingClientRect();
  assertEqual(rect.width > 0, true, "The fixture must have a measurable hit target.");
  const picked = pickElementUnderCursor(rect.left + rect.width / 2, rect.top + rect.height / 2, {
    isOurNode: () => false,
  });

  assertEqual(picked, button);
  fixture.remove();
});

test("pick mode skips extension-owned nodes in the hit-test stack", () => {
  const fixture = document.createElement("section");
  fixture.style.cssText = "position: fixed; left: 16px; top: 120px; width: 160px; height: 80px;";
  fixture.innerHTML = `
    <button type="button" style="width: 120px; height: 40px;">Copy me</button>
    <div data-ec-host="1" style="position: absolute; inset: 0;">Extension overlay</div>
  `;
  document.body.append(fixture);

  const button = fixture.querySelector("button");
  const rect = button.getBoundingClientRect();
  const picked = pickElementUnderCursor(rect.left + rect.width / 2, rect.top + rect.height / 2, {
    isOurNode: (node) => node instanceof Element && node.hasAttribute("data-ec-host"),
  });

  assertEqual(picked, button);
  fixture.remove();
});
