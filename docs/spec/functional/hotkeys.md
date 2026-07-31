# Keyboard shortcuts

- Keyboard shortcut and badge handling follow the standard rules
- No `suggested_key` in the manifest (content listener)
- Following DRY, the specific shortcuts are described in ../pages/shortcuts.md
- Browser commands (`_execute_action`, user-assigned `activate-deactivate` / `deactivate-copy-mode`) run in the background, grant `activeTab`, and inject the page script on demand—no prior inject required
- The in-page prefix chord (Ctrl+Shift+X / ⌘⇧X → C) needs the content script already on the document; it is unavailable on a fresh navigation until the user invokes the extension (toolbar, command, or context menu) on that tab
