# Element Copier — Chrome Web Store compliance

## Single purpose

Element Copier has one purpose: to let the user copy or download content from the web page they are viewing—either the whole page or a chosen element—in formats they select (for example rich text, Markdown, HTML, images, or developer-oriented selectors and paths). All extraction and conversion run locally in the browser; the extension does not browse the web on its own, show unrelated UI, or collect or transmit page data to any server.

---

## storage

The `storage` permission is used only to save the user’s preferences and short-lived session state on the device—such as theme, language, keyboard-shortcut options, enabled copy formats, panel state, and the most recent copy results per format—so settings persist between browser sessions and the copy panel can show the last result without asking the user to copy again.

---

## unlimitedStorage

The `unlimitedStorage` permission is needed because copied content—especially multi-format output, formatted text, HTML fragments, and image data—can exceed Chrome’s default `storage.local` quota when the user copies large or rich elements; it allows those larger last-copy caches to be kept locally until the user clears them or copies again, without failing silently due to quota limits.

---

## clipboardWrite

The `clipboardWrite` permission ensures that a copy action explicitly started by the user can finish after Element Copier has asynchronously picked an element, extracted its content, or generated the requested format. Browsers may no longer retain the original user activation after those steps; this permission lets the extension reliably place the requested text, HTML, image, or other generated format on the system clipboard instead of failing based on timing or browser behavior. The permission is not used to read clipboard contents, and copied data is never transmitted off the device.

---

## scripting

The `scripting` permission is used solely to inject the extension’s own page script into the active tab after the user clicks the toolbar icon, uses a registered keyboard command (`_execute_action`, `activate-deactivate`, or `deactivate-copy-mode`), or chooses an item from the extension’s context menu—so pick-mode highlighting, element selection, and format extraction run only on the page the user has just engaged with. The script is not registered for automatic injection on all sites.

---

## activeTab

The `activeTab` permission limits access to the tab the user is currently using when they invoke the extension—by clicking the toolbar icon, using a registered keyboard command, or choosing an item from the extension’s context menu—so the extension can inject its page script and read the DOM of that page only at user request to perform copy or download, without broad background access to tabs the user has not engaged with.

Copy and pick mode are available through the toolbar, `_execute_action`, and the user-assignable `activate-deactivate` / `deactivate-copy-mode` commands without requiring a prior content-script inject: those entry points grant `activeTab` and then inject on demand via `scripting`.

The optional in-page prefix chord (Ctrl+Shift+X / ⌘⇧X, release, then C) listens in the page and therefore works only after the content script has been injected on that document (for example after a toolbar click or a browser command on that tab). It cannot run before the first user gesture on a fresh navigation without a host permission such as `<all_urls>`, which this extension does not request. After navigation, a new user gesture is needed before the page-side chord is available again.

---

## contextMenus

The `contextMenus` permission registers menu items on the extension toolbar button (browser action) so the user can open the start or copied panel, settings, shortcuts, or about screen from a right-click on the icon; menus are rebuilt when locale or copy state changes and do not add items to unrelated page context menus.

The in-page element-selection menu is separate from the `contextMenus` permission. It is shown only after the user starts pick mode and right-clicks a highlighted element. The page-side script temporarily handles that user gesture to show the ancestor chain, preview elements on hover, and copy the item selected by the user; it does not create a persistent native browser context-menu item.

---

## Host permission

Element Copier does not request host access (`<all_urls>` or equivalent `host_permissions`). Page access is temporary and limited to the active tab after an explicit user action, via `activeTab` plus on-demand `scripting.executeScript`. Published extension resources used by the injected loader are listed under `web_accessible_resources` for `http(s)` and `file` pages only; that listing does not grant the extension standing access to those origins.
