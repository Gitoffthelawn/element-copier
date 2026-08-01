import { buildGenericHighlightPageCss } from "../highlight/page-styles.js";
import { createHighlightUiClasses } from "../highlight/classes.js";

var HIGHLIGHT_STYLE_ID = "element-copier-highlight-style";

var HIGHLIGHT_UI = createHighlightUiClasses("ec");

var HIGHLIGHT_PAGE_CSS = buildGenericHighlightPageCss(HIGHLIGHT_UI);

var COPIER_HIGHLIGHT_PAGE_STYLE = {
  styleId: HIGHLIGHT_STYLE_ID,
  pageCss: HIGHLIGHT_PAGE_CSS
};

export { COPIER_HIGHLIGHT_PAGE_STYLE, HIGHLIGHT_PAGE_CSS, HIGHLIGHT_STYLE_ID, HIGHLIGHT_UI };
