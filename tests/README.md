# Browser tests

Open `index.html` directly in a browser. No local server or dependencies are required.

- `unit/` contains isolated logic tests.
- `integration/` contains tests that combine browser primitives or extension components.
- `test-runner.js` runs registered tests in sequence and renders the report.

Add each test file to `index.html` after `test-runner.js`. The page exposes its machine-readable result as `data-test-status="passed"` or `data-test-status="failed"` on the root `<html>` element.
