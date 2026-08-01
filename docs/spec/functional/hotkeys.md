# Keyboard shortcuts

> [!NOTE]
> These hotkeys exist as a **hidden capability**. They are not shown in the panel UI (no SHORTCUTS page, menu item, or context-menu entry).
>
> We hid them because without the `<all_urls>` host permission the in-page prefix chord does not run on cold pages (fresh navigations) until the user has already invoked the extension on that tab. We chose mass-market users over advanced power users.

- Keyboard shortcut and badge handling follow the standard rules
- No `suggested_key` in the manifest for the in-page content listener (prefix action key)
- Browser commands (`_execute_action`, user-assignable `activate-deactivate` / `deactivate-copy-mode`, and the shared `prefix-chord`) run in the background, grant `activeTab`, and inject the page script on demand—no prior inject required
- The in-page prefix chord needs the content script already on the document; it is unavailable on a fresh navigation until the user invokes the extension (toolbar, command, or context menu) on that tab

## Hidden shortcut details

To run / stop the extension:

1. Press: `Ctrl+Shift+X`  
   on Mac: `Cmd+Shift+X`
2. Release the keys
3. Then press `C`

The 3-step shortcut is not obvious, but it is safer and avoids conflicts with other apps.

Do the steps above, but tap `C` twice to capture the whole page immediately.

To stop: `Esc`
