import { ext } from "../api.js";

async function fetchPickedFormatText(formatId) {
  try {
    const payload = await ext.runtime.sendMessage({
      type: "COPY_PICKED_FORMAT",
      formatId
    });
    if (!payload?.ok || payload.text === void 0) return void 0;
    return payload.text;
  } catch {
    return void 0;
  }
}

export { fetchPickedFormatText };
