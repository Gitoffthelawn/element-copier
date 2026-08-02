# Browser tests

Run the complete suite from the project root:

```sh
./tests/run-tests.sh
```

The wrapper uses the shared runner from the neighboring `browser-extension-ci-cd` repository. Set `BROWSER_EXTENSION_CI_CD` if that repository is checked out elsewhere. The runner starts a temporary Python localhost, executes `index.html` in headless Chrome or Chromium, prints JSON, and always stops the server and browser. Exit code `0` means passed, `1` means failed tests, and `2` means an infrastructure error.

- `unit/` contains isolated logic tests.
- `integration/` contains tests that combine browser primitives or extension components.
- The shared browser harness runs registered tests in sequence and renders the report.

Add each test file to `index.html` after the shared harness. The page exposes its machine-readable result as `data-test-status="passed"` or `data-test-status="failed"` on the root `<html>` element.
