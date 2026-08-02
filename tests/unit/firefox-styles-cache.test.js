"use strict";

import { collectStylesheetContext } from "../../extension/lib/our/copy/styles.js";

const { assert, assertEqual, test } = TestHarness;

async function readProjectFile(pathFromRoot) {
  const response = await fetch(`/${pathFromRoot}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${pathFromRoot}`);
  }
  return response.text();
}

function makeNonIterableAdoptedSheets(sheets) {
  const list = {
    length: sheets.length,
    [Symbol.iterator]() {
      throw new TypeError("adoptedSheets is not iterable");
    },
  };
  for (let i = 0; i < sheets.length; i += 1) {
    list[i] = sheets[i];
  }
  return list;
}

test("styles.js iterates adoptedStyleSheets by index for Firefox bug 1770592", async () => {
  const stylesSource = await readProjectFile("extension/lib/our/copy/styles.js");

  assert(
    !/for\s*\(\s*const\s+\w+\s+of\s+adoptedSheets\s*\)/.test(stylesSource),
    "styles.js must not iterate adoptedStyleSheets with for...of."
  );
  assert(
    /for\s*\(\s*let\s+i\s*=\s*0;\s*i\s*<\s*adoptedSheets\.length/.test(stylesSource),
    "styles.js must iterate adoptedStyleSheets by index."
  );
  assert(/1770592/.test(stylesSource), "styles.js should document Firefox bug 1770592.");
});

test("pick-copy-cache wraps each format snapshot in try/catch", async () => {
  const cacheSource = await readProjectFile("extension/app/pick-mode/pick-copy-cache.js");

  assert(
    /format snapshot failed:\s*",\s*formatId/.test(cacheSource),
    "pick-copy-cache must log the failing format id."
  );
  assert(
    /for\s*\(\s*const\s+formatId\s+of\s+prioritizeSnapshotFormats[\s\S]*?try\s*\{[\s\S]*?\}\s*catch\s*\(\s*error\s*\)/.test(cacheSource),
    "each format snapshot must be wrapped in try/catch."
  );
});

test("collectStylesheetContext reads non-iterable adoptedStyleSheets by index", () => {
  const fakeSheet = { cssRules: [], ownerNode: {}, href: null };
  const fakeDoc = {
    styleSheets: { length: 0 },
    adoptedStyleSheets: makeNonIterableAdoptedSheets([fakeSheet]),
  };
  const fakeElement = {
    ownerDocument: fakeDoc,
    parentNode: null,
  };

  const context = collectStylesheetContext(fakeElement);
  assertEqual(context.sheets.length, 1, "Indexed adopted sheets must still be collected.");
  assertEqual(context.adopted.has(fakeSheet), true, "The adopted set must include indexed sheets.");
});

test("collectStylesheetContext ignores adoptedStyleSheets getter failures", () => {
  const emptyDoc = {
    styleSheets: { length: 0 },
    get adoptedStyleSheets() {
      throw new TypeError("adoptedStyleSheets unavailable");
    },
  };
  const emptyContext = collectStylesheetContext({
    ownerDocument: emptyDoc,
    parentNode: null,
  });

  assertEqual(emptyContext.sheets.length, 0, "A getter failure must not throw.");
});
