// Classic content-script shim. Scripts injected via scripting.executeScript with
// `files` cannot be ES modules, so this loader dynamically imports the real module
// graph. The extension URL is same-origin and listed in web_accessible_resources,
// which Chrome and Firefox (89+) both require for dynamic import from a content
// script. The module registry is per-document, so repeated injection is idempotent.
(() => {
  const api = typeof browser !== "undefined" ? browser : chrome;
  // Firefox returns the completion value of an injected script to the background.
  // A dynamic import resolves to a module namespace object, which Firefox 140
  // cannot structured-clone. Always resolve this chain to null instead.
  import(api.runtime.getURL("app/content/main.js"))
    .then(() => null)
    .catch((error) => {
      console.error("[Element Copier] failed to load content module", error);
      return null;
    });
})();
