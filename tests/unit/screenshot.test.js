"use strict";

import { encodeJpeg } from "../../extension/app/copy/screenshot.js";

const { assertEqual, test } = TestHarness;

test("JPEG composition uses the rendered canvas without a second canvas", () => {
  const operations = [];
  const context = {
    globalCompositeOperation: "source-over",
    fillStyle: "",
    save() {
      operations.push("save");
    },
    fillRect(x, y, width, height) {
      operations.push([
        "fillRect",
        x,
        y,
        width,
        height,
        this.globalCompositeOperation,
        this.fillStyle
      ]);
    },
    restore() {
      operations.push("restore");
    }
  };
  const canvas = {
    width: 320,
    height: 180,
    getContext(type) {
      assertEqual(type, "2d");
      return context;
    },
    toDataURL(type, quality) {
      assertEqual(type, "image/jpeg");
      assertEqual(quality, 0.92);
      operations.push("toDataURL");
      return "data:image/jpeg;base64,probe";
    }
  };

  const result = encodeJpeg(canvas, [{ color: "rgb(255, 255, 255)" }]);

  assertEqual(result, "data:image/jpeg;base64,probe");
  assertEqual(JSON.stringify(operations), JSON.stringify([
    "save",
    ["fillRect", 0, 0, 320, 180, "destination-over", "rgb(255, 255, 255)"],
    "restore",
    "toDataURL"
  ]));
});
