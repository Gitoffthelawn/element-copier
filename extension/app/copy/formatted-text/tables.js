import { TABLE_CELL_STYLE, TABLE_STYLE } from "./constants.js";
import { mergeInlineStyle } from "./style-utils.js";

function enhanceClipboardTables(root2) {
  for (const table of root2.querySelectorAll("table")) {
    mergeInlineStyle(table, TABLE_STYLE);
    if (!table.hasAttribute("border")) {
      table.setAttribute("border", "1");
    }
    if (!table.hasAttribute("cellspacing")) {
      table.setAttribute("cellspacing", "0");
    }
    if (!table.hasAttribute("cellpadding")) {
      table.setAttribute("cellpadding", "4");
    }
    for (const cell of table.querySelectorAll("th, td")) {
      mergeInlineStyle(cell, TABLE_CELL_STYLE);
    }
  }
}

function normalizePlainCellText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function tableElementToPlain(table) {
  const rows = [];
  for (const row of table.querySelectorAll("tr")) {
    const cells = [];
    for (const cell of row.querySelectorAll("th, td")) {
      const value = normalizePlainCellText(cell.textContent ?? "");
      if (value) cells.push(value);
    }
    if (cells.length > 0) {
      rows.push(cells.join("	"));
    }
  }
  return rows.join("\n");
}

export { enhanceClipboardTables, normalizePlainCellText, tableElementToPlain };
