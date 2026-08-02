import { PREFIX_ACTION_TIMEOUT_MS, PREFIX_DOUBLE_ACTION_WINDOW_MS, isPrefixActionKeyEvent, isPrefixChordHeld, isPrefixChordKeyEvent } from "./keys.js";

function createPrefixModeController(options) {
  let armed = false;
  let timeoutId;
  let singleActionTimeoutId;
  let chordHeld = false;
  let awaitingRelease = false;
  let firstActionPressAt = 0;
  const doubleActionWindowMs = options.doubleActionWindowMs ?? PREFIX_DOUBLE_ACTION_WINDOW_MS;
  const clearTimeoutIfAny = () => {
    if (timeoutId !== void 0) {
      clearTimeout(timeoutId);
      timeoutId = void 0;
    }
  };
  const clearSingleActionTimeout = () => {
    if (singleActionTimeoutId !== void 0) {
      clearTimeout(singleActionTimeoutId);
      singleActionTimeoutId = void 0;
    }
  };
  const disarm = () => {
    armed = false;
    awaitingRelease = false;
    chordHeld = false;
    firstActionPressAt = 0;
    clearTimeoutIfAny();
    clearSingleActionTimeout();
    options.hint.hide();
  };
  const canOperateOnPage = async () => !options.canShowPrefixHint || await options.canShowPrefixHint();
  const tryArmAfterPrefixRelease = () => {
    void (async () => {
      if (!await options.isEnabled()) {
        options.hint.hide();
        return;
      }
      if (!await canOperateOnPage()) {
        options.hint.hide();
        return;
      }
      arm(options.hintLetter);
    })();
  };
  const arm = (letter) => {
    clearTimeoutIfAny();
    armed = true;
    options.hint.show(letter);
    timeoutId = setTimeout(() => {
      disarm();
    }, PREFIX_ACTION_TIMEOUT_MS);
  };
  const onPrefixChordKeyDown = (e) => {
    if (!isPrefixChordKeyEvent(e)) return;
    chordHeld = true;
  };
  const onPrefixChordKeyUp = (e) => {
    if (!chordHeld && !awaitingRelease) return;
    if (isPrefixChordHeld(e)) return;
    chordHeld = false;
    awaitingRelease = false;
    clearTimeoutIfAny();
    tryArmAfterPrefixRelease();
  };
  const prepareAwaitAction = (_letter = options.hintLetter) => {
    clearTimeoutIfAny();
    armed = false;
    chordHeld = false;
    awaitingRelease = false;
    tryArmAfterPrefixRelease();
  };
  const fireSingleAction = () => {
    clearSingleActionTimeout();
    firstActionPressAt = 0;
    disarm();
    options.onAction();
  };
  const fireDoubleAction = () => {
    clearSingleActionTimeout();
    firstActionPressAt = 0;
    disarm();
    options.onDoubleAction?.();
  };
  const onPrefixActionKeyDown = (e) => {
    if (!isPrefixActionKeyEvent(e, options.hintLetter)) return;
    if (e.repeat) return;
    void (async () => {
      if (!await options.isEnabled()) return;
      const canOperate = await canOperateOnPage();
      if (!armed) {
        if (!canOperate) {
          e.preventDefault();
          e.stopPropagation();
          options.hint.hide();
          options.onPrefixHintBlocked?.();
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (!canOperate) {
        disarm();
        options.onPrefixHintBlocked?.();
        return;
      }
      if (!options.onDoubleAction) {
        disarm();
        options.onAction();
        return;
      }
      const now = Date.now();
      if (firstActionPressAt > 0 && now - firstActionPressAt < doubleActionWindowMs) {
        fireDoubleAction();
        return;
      }
      firstActionPressAt = now;
      clearSingleActionTimeout();
      clearTimeoutIfAny();
      timeoutId = setTimeout(() => {
        disarm();
      }, PREFIX_ACTION_TIMEOUT_MS);
      singleActionTimeoutId = setTimeout(() => {
        singleActionTimeoutId = void 0;
        if (!armed) return;
        fireSingleAction();
      }, doubleActionWindowMs);
    })();
  };
  return {
    onPrefixChordKeyDown,
    onPrefixChordKeyUp,
    onPrefixActionKeyDown,
    prepareAwaitAction,
    arm,
    disarm
  };
}

export { createPrefixModeController };
