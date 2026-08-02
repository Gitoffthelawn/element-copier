import { WELCOME_SESSION_DATA_KEY } from "./constants.js";
import { bootstrapWelcomePage } from "./page-ui.js";
import { isRtlLocale } from "../i18n/rtl.js";

void bootstrapWelcomePage({
  sessionDataKey: WELCOME_SESSION_DATA_KEY,
  localeStorageKey: "locale",
  localeUserSelectedKey: "localeUserSelected",
  pinStatusChangedMessageType: "PIN_STATUS_CHANGED",
  watchPinStatusMessageType: "WATCH_PIN_STATUS",
  isRtlLocale
});
