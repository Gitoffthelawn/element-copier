# MENU

---

## MENU ITEMS

### Contains
- One of the following:
   - play // START -- if the cache is empty
   - files // COPIED -- if the cache is not empty
- settings // SETTINGS
- info // ABOUT

### Does not contain
- Welcome
- Saved
- keyboard // SHORTCUTS

---

## VERTICAL MENU
- Used in all popup windows (including SAVED)
- Not used in the welcome window
- Layout:
  - Vertical rectangle slightly darker than the background
  - On the left (including RTL)
  - Fills the parent element's height
  - 2 mm spacing on the left, top, and bottom
- Menu items:
  - No labels, lucide icons only
  - Each menu item has an immediate tooltip. Tooltip text matches the page name
  - Spacing between items is equal
  - Spacing from the menu element's edges is equal

---

## CONTEXT MENU
- Uses the same list of items
- Uses relevant emoji instead of lucide icons

## IN-PAGE ELEMENT CONTEXT MENU
- Available only in pick mode when an element is highlighted
- Opened with the right mouse button over the highlighted element
- Replaces the browser's native page context menu only while pick mode is active
- Displays the complete DOM ancestor chain, including `html`, `body`, technical containers, and `THIS ELEMENT`
- Hovering an item previews that element with the page highlight
- Clicking an item copies that element and closes the menu
- Clicking outside the menu, navigating to another page, or disabling pick mode closes the menu without copying
- Escape keeps its existing behavior of disabling the extension
