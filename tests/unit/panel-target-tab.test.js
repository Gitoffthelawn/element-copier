import { selectPanelTargetTabId } from "../../extension/app/panel-popup/panel-target-tab.js";

const { assertEqual, test } = TestHarness;

test("native action popup targets the current active tab instead of a remembered tab", () => {
  assertEqual(
    selectPanelTargetTabId({
      senderTabId: void 0,
      senderIsExtensionPanel: false,
      rememberedTabId: 24,
      activeTabId: 25
    }),
    25
  );
});

test("content sender targets its own tab", () => {
  assertEqual(
    selectPanelTargetTabId({
      senderTabId: 31,
      senderIsExtensionPanel: false,
      rememberedTabId: 24,
      activeTabId: 25
    }),
    31
  );
});

test("panel opened in an extension tab keeps its remembered target", () => {
  assertEqual(
    selectPanelTargetTabId({
      senderTabId: 40,
      senderIsExtensionPanel: true,
      rememberedTabId: 24,
      activeTabId: 40
    }),
    24
  );
});
