import { PREFIX_ACTION_KEY } from "./commands.js";
import { isMacPlatform } from "./platform.js";

var PREFIX_ACTION_TIMEOUT_MS = 3e3;

var PREFIX_DOUBLE_ACTION_WINDOW_MS = 400;

var PREFIX_CHORD_KEY = "x";

function isEscapeKeyEvent(e) {
  return e.key === "Escape";
}

function letterToCode(letter) {
  return `Key${letter.toUpperCase()}`;
}

function isLetterKeyEvent(e, letter) {
  const expectedCode = letterToCode(letter);
  if (typeof e.code === "string" && e.code.length > 0) {
    return e.code === expectedCode;
  }
  return e.key.toLowerCase() === letter.toLowerCase();
}

function isModifierShiftKeyEvent(e, key, mac = isMacPlatform()) {
  const modifier = mac ? e.metaKey : e.ctrlKey;
  return modifier && e.shiftKey && isLetterKeyEvent(e, key);
}

function isPrefixChordKeyEvent(e, mac = isMacPlatform()) {
  return isModifierShiftKeyEvent(e, PREFIX_CHORD_KEY, mac);
}

function isPrefixChordHeld(e, mac = isMacPlatform()) {
  const modifier = mac ? e.metaKey : e.ctrlKey;
  return modifier && e.shiftKey;
}

function isPrefixActionKeyEvent(e, key) {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  return isLetterKeyEvent(e, key);
}

var ABOUT_PREFIX_CHORD_WIN_DISPLAY = "Ctrl+Shift+X";

var ABOUT_PREFIX_CHORD_MAC_DISPLAY = "Cmd+Shift+X";

function getStartHotkeyActionLabel() {
  return PREFIX_ACTION_KEY.toUpperCase();
}

function isEscHotkeyEvent(e) {
  return isEscapeKeyEvent(e);
}

export { ABOUT_PREFIX_CHORD_MAC_DISPLAY, ABOUT_PREFIX_CHORD_WIN_DISPLAY, PREFIX_ACTION_TIMEOUT_MS, PREFIX_CHORD_KEY, PREFIX_DOUBLE_ACTION_WINDOW_MS, getStartHotkeyActionLabel, isEscHotkeyEvent, isEscapeKeyEvent, isLetterKeyEvent, isModifierShiftKeyEvent, isPrefixActionKeyEvent, isPrefixChordHeld, isPrefixChordKeyEvent, letterToCode };
