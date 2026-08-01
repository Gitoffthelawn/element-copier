import { domToCanvas as renderDomToCanvas } from "./modern-screenshot/index.js";

function domToCanvas(node, options) {
  return renderDomToCanvas(node, options);
}

export { domToCanvas };
