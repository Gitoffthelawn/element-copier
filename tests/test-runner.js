"use strict";

(() => {
  const tests = [];

  function test(name, execute) {
    if (typeof name !== "string" || !name.trim()) {
      throw new TypeError("Test name must be a non-empty string.");
    }
    if (typeof execute !== "function") {
      throw new TypeError(`Test "${name}" must provide a function.`);
    }
    tests.push({ name, execute });
  }

  function assert(condition, message = "Expected condition to be true.") {
    if (!condition) throw new Error(message);
  }

  function assertEqual(actual, expected, message) {
    if (!Object.is(actual, expected)) {
      throw new Error(message || `Expected ${String(expected)}, received ${String(actual)}.`);
    }
  }

  function renderResult(list, result) {
    const item = document.createElement("li");
    item.dataset.testStatus = result.passed ? "passed" : "failed";
    item.textContent = `${result.passed ? "✅" : "❌"} ${result.name}`;

    if (result.error) {
      const details = document.createElement("pre");
      details.textContent = result.error.stack || result.error.message || String(result.error);
      item.append(details);
    }

    list.append(item);
  }

  async function run() {
    const root = document.documentElement;
    const summary = document.querySelector("#summary");
    const list = document.querySelector("#results");
    root.dataset.testStatus = "running";
    summary.textContent = `Running ${tests.length} tests…`;

    let passed = 0;
    for (const current of tests) {
      try {
        await current.execute();
        passed += 1;
        renderResult(list, { name: current.name, passed: true });
        console.log(`PASS ${current.name}`);
      } catch (error) {
        renderResult(list, { name: current.name, passed: false, error });
        console.error(`FAIL ${current.name}`, error);
      }
    }

    const failed = tests.length - passed;
    root.dataset.testStatus = failed === 0 ? "passed" : "failed";
    summary.textContent = `${passed} passed, ${failed} failed, ${tests.length} total.`;
  }

  globalThis.TestHarness = Object.freeze({ assert, assertEqual, test });
  window.addEventListener("DOMContentLoaded", () => void run(), { once: true });
})();
