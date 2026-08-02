"use strict";

import { createPrefixModeController } from "../../extension/app/hotkeys/prefix-mode.js";

const { assertEqual, test } = TestHarness;

function isMacPlatform() {
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

function prefixChordModifiers(pressed) {
  return isMacPlatform()
    ? { metaKey: pressed, shiftKey: pressed }
    : { ctrlKey: pressed, shiftKey: pressed };
}

function keyEvent(key, options = {}) {
  return new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key,
    code: `Key${key.toUpperCase()}`,
    ...options,
  });
}

function prefixChordReleaseEvent() {
  return new KeyboardEvent("keyup", prefixChordModifiers(false));
}

async function settleAsyncWork() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

test("prefix shortcut dispatches one element-copy action only after the chord has armed it", async () => {
  let actions = 0;
  let hints = 0;
  const controller = createPrefixModeController({
    hintLetter: "c",
    hint: { show: () => { hints += 1; }, hide: () => {} },
    isEnabled: async () => true,
    onAction: () => { actions += 1; },
    canShowPrefixHint: async () => true,
    doubleActionWindowMs: 5,
  });

  const beforeArm = keyEvent("c");
  controller.onPrefixActionKeyDown(beforeArm);
  await settleAsyncWork();
  assertEqual(actions, 0);
  assertEqual(beforeArm.defaultPrevented, false);

  controller.onPrefixChordKeyDown(keyEvent("x", prefixChordModifiers(true)));
  controller.onPrefixChordKeyUp(prefixChordReleaseEvent());
  await settleAsyncWork();
  assertEqual(hints, 1);

  const action = keyEvent("c");
  controller.onPrefixActionKeyDown(action);
  await new Promise((resolve) => setTimeout(resolve, 15));
  assertEqual(action.defaultPrevented, true);
  assertEqual(actions, 1);
});

test("double prefix action captures the whole page instead of firing two single copies", async () => {
  let singleActions = 0;
  let doubleActions = 0;
  const controller = createPrefixModeController({
    hintLetter: "c",
    hint: { show: () => {}, hide: () => {} },
    isEnabled: async () => true,
    onAction: () => { singleActions += 1; },
    onDoubleAction: () => { doubleActions += 1; },
    canShowPrefixHint: async () => true,
    doubleActionWindowMs: 40,
  });

  controller.arm("c");
  controller.onPrefixActionKeyDown(keyEvent("c"));
  await settleAsyncWork();
  controller.onPrefixActionKeyDown(keyEvent("c"));
  await new Promise((resolve) => setTimeout(resolve, 10));

  assertEqual(singleActions, 0);
  assertEqual(doubleActions, 1);
});
