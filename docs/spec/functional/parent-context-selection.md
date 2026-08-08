# Parent selection from the in-page context menu

## Starting
- Works when the extension is running in pick mode and an element is highlighted.
- The user opens the in-page context menu by clicking the right mouse button over the highlighted element.
- The browser's standard page context menu is suppressed only while pick mode is active.

## Menu contents
- The menu displays the complete DOM ancestor chain of the element under the pointer.
- The chain is ordered from the highest ancestor to the current element:
   - `html`
   - `body`
   - each parent element in order
   - `THIS ELEMENT`
- All elements in the chain are displayed, including technical and otherwise non-semantic containers.
- Long chains are scrollable.

## Preview and selection
- Hovering a menu item moves the animated page highlight to the corresponding element.
- The menu remains open while the user previews different levels.
- The current element is visually distinguished from its ancestors.
- Clicking a menu button copies the corresponding element and closes the menu immediately; the standard copy flow then continues.

## Closing
- Clicking outside the menu closes it without copying.
- Navigating to another page closes it.
- Disabling pick mode closes it.
- Escape keeps its existing behavior and disables the extension; it is not assigned a separate menu-closing action.

## Considerations
- The feature provides an explicit way to select a parent whose visible area is fully covered by child elements.
- The context menu is an in-page UI layer and does not add items to the browser's native page context menu.
- Iframes continue to follow the existing iframe selection limitations.
