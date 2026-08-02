"use strict";

const { assertEqual, test } = TestHarness;

const constantsUrl = new URL("../../extension/app/support-survey/constants.js", import.meta.url);

function restoreGlobal(key, previous) {
  if (previous === undefined) {
    delete globalThis[key];
    return;
  }
  globalThis[key] = previous;
}

async function withRuntimeGlobals(globals, run) {
  const previousChrome = globalThis.chrome;
  const previousBrowser = globalThis.browser;
  const previousNavigator = globalThis.navigator;

  if (Object.prototype.hasOwnProperty.call(globals, "chrome")) {
    globalThis.chrome = globals.chrome;
  }
  if (Object.prototype.hasOwnProperty.call(globals, "browser")) {
    globalThis.browser = globals.browser;
  }
  if (Object.prototype.hasOwnProperty.call(globals, "navigator")) {
    Object.defineProperty(globalThis, "navigator", {
      value: globals.navigator,
      configurable: true,
    });
  }

  try {
    const mod = await import(`${constantsUrl.href}?t=${Date.now()}-${Math.random()}`);
    return await run(mod);
  } finally {
    restoreGlobal("chrome", previousChrome);
    restoreGlobal("browser", previousBrowser);
    Object.defineProperty(globalThis, "navigator", {
      value: previousNavigator,
      configurable: true,
    });
  }
}

test("support survey store links follow the Chromium extension runtime", async () => {
  await withRuntimeGlobals(
    {
      chrome: { runtime: { getURL: (path) => `chrome-extension://id${path}` } },
      browser: undefined,
    },
    (mod) => {
      assertEqual(mod.isFirefoxExtensionRuntime(), false);
      assertEqual(mod.getSupportSurveyStoreListingUrl(), mod.SUPPORT_SURVEY_CHROME_STORE_URL);
      assertEqual(mod.getSupportSurveyStoreRateLabel(), "Rate in Chrome web store");
    }
  );
});

test("support survey store links ignore a browser polyfill on Chromium", async () => {
  const chromeApi = { runtime: { getURL: (path) => `chrome-extension://id${path}` } };
  const browserApi = { runtime: { getURL: (path) => `chrome-extension://id${path}` } };
  await withRuntimeGlobals({ chrome: chromeApi, browser: browserApi }, (mod) => {
    assertEqual(mod.isFirefoxExtensionRuntime(), false);
    assertEqual(mod.getSupportSurveyStoreListingUrl(), mod.SUPPORT_SURVEY_CHROME_STORE_URL);
  });
});

test("support survey store links follow the Firefox extension runtime", async () => {
  await withRuntimeGlobals(
    {
      browser: { runtime: { getURL: (path) => `moz-extension://id${path}` } },
      chrome: { runtime: { getURL: (path) => `moz-extension://id${path}` } },
    },
    (mod) => {
      assertEqual(mod.isFirefoxExtensionRuntime(), true);
      assertEqual(mod.getSupportSurveyStoreListingUrl(), mod.SUPPORT_SURVEY_FIREFOX_STORE_URL);
      assertEqual(mod.getSupportSurveyStoreRateLabel(), "Rate in Firefox store");
    }
  );
});

test("support survey store links fall back to Firefox user agent detection", async () => {
  await withRuntimeGlobals(
    {
      chrome: undefined,
      browser: undefined,
      navigator: {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0",
      },
    },
    (mod) => {
      assertEqual(mod.isFirefoxExtensionRuntime(), true);
      assertEqual(mod.getSupportSurveyStoreListingUrl(), mod.SUPPORT_SURVEY_FIREFOX_STORE_URL);
    }
  );
});

test("support survey store links fall back to Chromium user agent detection", async () => {
  await withRuntimeGlobals(
    {
      chrome: undefined,
      browser: undefined,
      navigator: {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
      },
    },
    (mod) => {
      assertEqual(mod.isFirefoxExtensionRuntime(), false);
      assertEqual(mod.getSupportSurveyStoreListingUrl(), mod.SUPPORT_SURVEY_CHROME_STORE_URL);
    }
  );
});
