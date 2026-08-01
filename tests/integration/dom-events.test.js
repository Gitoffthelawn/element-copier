"use strict";

TestHarness.test("browser dispatches a click event to a DOM element", () => {
  const button = document.createElement("button");
  let clickCount = 0;
  button.addEventListener("click", () => {
    clickCount += 1;
  });

  document.body.append(button);
  button.click();
  button.remove();

  TestHarness.assertEqual(clickCount, 1);
});
