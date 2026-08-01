"use strict";

TestHarness.test("test harness executes a synchronous assertion", () => {
  TestHarness.assertEqual(2 + 2, 4);
});
