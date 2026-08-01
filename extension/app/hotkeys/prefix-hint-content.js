import { PREFIX_HINT_HIDE, PREFIX_HINT_SHOW } from "./prefix-hint-messages.js";
import { ext } from "../api.js";

function createContentPrefixHintSink() {
  return {
    show(letter) {
      void ext.runtime.sendMessage({ type: PREFIX_HINT_SHOW, letter }).catch(() => {
      });
    },
    hide() {
      void ext.runtime.sendMessage({ type: PREFIX_HINT_HIDE }).catch(() => {
      });
    }
  };
}

export { createContentPrefixHintSink };
