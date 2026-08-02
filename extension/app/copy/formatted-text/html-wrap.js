function wrapClipboardHtml(fragment) {
  if (!fragment) return "";
  return '<html><head><meta charset="utf-8"></head><body><!--StartFragment-->' + fragment + "<!--EndFragment--></body></html>";
}

export { wrapClipboardHtml };
