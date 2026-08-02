"use strict";

import { getJsPath } from "../../extension/lib/our/copy/js-path.js";
import { getCssSelector } from "../../extension/lib/our/copy/selector.js";
import { evaluateXPath, getFullXPath, getXPath } from "../../extension/lib/our/copy/xpath.js";

const { assert, assertEqual, test } = TestHarness;

test("stable selector prefers a test identifier and still resolves the selected element", () => {
  const fixture = document.createElement("section");
  fixture.innerHTML = '<button data-testid="checkout primary">Pay</button><button>Cancel</button>';
  document.body.append(fixture);

  const target = fixture.querySelector("button");
  const selector = getCssSelector(target);

  assert(selector.includes('button[data-testid="checkout primary"]'));
  assertEqual(document.querySelector(selector), target);
  fixture.remove();
});

test("duplicate sibling elements receive a selector that does not select a neighbour", () => {
  const fixture = document.createElement("div");
  fixture.innerHTML = '<span class="status">New</span><span class="status">Old</span>';
  document.body.append(fixture);

  const target = fixture.children[1];
  const selector = getCssSelector(target);

  assertEqual(document.querySelectorAll(selector).length, 1);
  assertEqual(document.querySelector(selector), target);
  fixture.remove();
});

test("XPath uses an escaped unique id and full XPath resolves repeated siblings", () => {
  const fixture = document.createElement("main");
  fixture.innerHTML = '<div id="quote\'and\"double"><span>first</span><span>second</span></div>';
  document.body.append(fixture);

  const anchored = fixture.firstElementChild;
  const repeatedTarget = anchored.lastElementChild;
  const anchoredPath = getXPath(anchored);
  const fullPath = getFullXPath(repeatedTarget);

  assert(evaluateXPath(anchoredPath, anchored), "The id-based XPath must point to its element.");
  assert(evaluateXPath(fullPath, repeatedTarget), "The full XPath must point to the second sibling.");
  fixture.remove();
});

test("JavaScript path falls back to a child index when duplicated ids prevent a unique selector", () => {
  const fixture = document.createElement("div");
  fixture.innerHTML = '<span id="duplicated-id">first</span><span id="duplicated-id">second</span>';
  document.body.append(fixture);

  const target = fixture.children[1];
  const path = getJsPath(target);
  const resolved = Function(`return ${path};`)();

  assert(path.includes("children[1]"), "The fallback path must retain the sibling index.");
  assertEqual(resolved, target);
  fixture.remove();
});
