"use strict";

import { createSupportSurveyLogic } from "../../extension/app/support-survey/logic-core.js";

const { assert, assertEqual, test } = TestHarness;
const threshold = 25;
const cooldownMs = 60 * 24 * 60 * 60 * 1000;
const survey = createSupportSurveyLogic({ threshold, cooldownMs });

test("support survey threshold defaults to 25 successful actions", () => {
  assertEqual(threshold, 25);
  assertEqual(survey.createDefaultState().actionCount, 0);
  assert(!survey.canShow(survey.addSuccessfulActions(survey.createDefaultState(), 24)));
  assert(survey.canShow(survey.addSuccessfulActions(survey.createDefaultState(), 25)));
});

test("support survey appears on threshold crossing, then respects cooldown and next anchor", () => {
  const now = 1_800_000_000_000;
  const reachedThreshold = survey.addSuccessfulActions(survey.createDefaultState(), 25);
  assert(survey.canShow(reachedThreshold, now));

  const shown = survey.markShown(reachedThreshold, now);
  assert(!survey.canShow(shown, now + 59 * 24 * 60 * 60 * 1000));

  const deferred = survey.defer(shown);
  const beforeNextThreshold = survey.addSuccessfulActions(deferred, 24);
  assert(!survey.canShow(beforeNextThreshold, now + 61 * 24 * 60 * 60 * 1000));
  const nextThreshold = survey.addSuccessfulActions(beforeNextThreshold);
  assert(survey.canShow(nextThreshold, now + 61 * 24 * 60 * 60 * 1000));
});

test("support survey safely normalizes damaged stored state without resurrecting invalid counters", () => {
  const normalized = survey.normalizeState({
    actionCount: -8,
    actionCountAtLastDeferral: 500,
    neverAsk: "yes",
    completed: 1,
    lastShownAt: Infinity,
  });

  assertEqual(normalized.actionCount, 0);
  assertEqual(normalized.actionCountAtLastDeferral, 0);
  assertEqual(normalized.neverAsk, false);
  assertEqual(normalized.completed, false);
  assertEqual(normalized.lastShownAt, null);
});

test("Never ask and completed choices permanently prevent future survey display", () => {
  const eligible = survey.addSuccessfulActions(survey.createDefaultState(), 25);
  assert(!survey.canShow(survey.disableForever(eligible), Date.now()));
  assert(!survey.canShow(survey.markCompleted(eligible), Date.now()));
});
