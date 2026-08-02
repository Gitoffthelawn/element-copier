"use strict";

const { assert, test } = TestHarness;

async function readProjectFile(pathFromRoot) {
  const response = await fetch(`/${pathFromRoot}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${pathFromRoot}`);
  }
  return response.text();
}

test("manifest requests clipboardWrite for Firefox async copy flows", async () => {
  const manifest = JSON.parse(await readProjectFile("extension/manifest.json"));
  assert(
    Array.isArray(manifest.permissions) && manifest.permissions.includes("clipboardWrite"),
    "manifest must request clipboardWrite so Firefox can copy after async pick/cache work."
  );
});

test("plain-text clipboard copy prefers execCommand on insecure pages", async () => {
  const clipboardSource = await readProjectFile("extension/app/element-copy/clipboard.js");
  assert(
    /isSecureContext === false/.test(clipboardSource),
    "plain-text copy must prefer execCommand on insecure pages."
  );
  assert(
    /Promise\.resolve/.test(clipboardSource),
    "ClipboardItem values must be Promise-wrapped for older Firefox."
  );
  assert(
    /COPY_IMAGE_TO_CLIPBOARD/.test(clipboardSource),
    "Firefox image copy must use the WebExtension clipboard API."
  );
});

test("background service worker handles Firefox image clipboard writes", async () => {
  const backgroundSource = await readProjectFile("extension/app/background/main.js");
  assert(
    /clipboard\.setImageData/.test(backgroundSource),
    "background must handle Firefox image clipboard writes."
  );
});

test("formatted clipboard copy keeps Firefox and insecure-page fallbacks", async () => {
  const formattedSource = await readProjectFile("extension/lib/our/copy/formatted-text/clipboard.js");
  assert(
    /isFirefox\(\) \|\| globalThis\.isSecureContext === false/.test(formattedSource),
    "formatted copy must prefer legacy execCommand in Firefox and on insecure pages."
  );
  assert(
    /Promise\.resolve\(new Blob/.test(formattedSource),
    "formatted ClipboardItem blobs must be Promise-wrapped for Firefox."
  );
});
