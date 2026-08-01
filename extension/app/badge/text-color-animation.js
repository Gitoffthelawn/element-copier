function toHex(value) {
  return value.toString(16).padStart(2, "0");
}

function mixColor(from, to, ratio) {
  const normalizedRatio = Math.max(0, Math.min(1, ratio));
  const r = Math.round(from[0] + (to[0] - from[0]) * normalizedRatio);
  const g = Math.round(from[1] + (to[1] - from[1]) * normalizedRatio);
  const b = Math.round(from[2] + (to[2] - from[2]) * normalizedRatio);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function normalizeFrame(frame, totalFrames) {
  return (frame % totalFrames + totalFrames) % totalFrames;
}

function resolveStep(frame, steps, mode) {
  const totalFrames = mode === "ping-pong" ? steps * 2 : steps;
  const normalizedFrame = normalizeFrame(frame, totalFrames);
  if (mode === "loop") return normalizedFrame + 1;
  if (normalizedFrame < steps) return normalizedFrame + 1;
  return totalFrames - normalizedFrame;
}

function createBadgeTextColorAnimation(options) {
  const steps = Math.max(2, Math.floor(options.steps));
  const mode = options.mode ?? "ping-pong";
  const totalFrames = mode === "ping-pong" ? steps * 2 : steps;
  const hasMidColor = "midColor" in options;
  const midStep = hasMidColor ? Math.min(steps - 1, Math.max(1, Math.floor(steps / 2))) : 1;
  const firstSpan = Math.max(1, midStep - 1);
  const secondSpan = Math.max(1, steps - midStep);
  return {
    totalFrames,
    stepIntervalMs: Math.max(1, Math.floor(options.stepIntervalMs)),
    nextFrame: (frame) => (normalizeFrame(frame, totalFrames) + 1) % totalFrames,
    getColor: (frame) => {
      const step = resolveStep(frame, steps, mode);
      if (!hasMidColor) {
        const ratio2 = (step - 1) / Math.max(1, steps - 1);
        return mixColor(options.startColor, options.endColor, ratio2);
      }
      if (step <= midStep) {
        const ratio2 = (step - 1) / firstSpan;
        return mixColor(options.startColor, options.midColor, ratio2);
      }
      const ratio = (step - midStep) / secondSpan;
      return mixColor(options.midColor, options.endColor, ratio);
    }
  };
}

export { createBadgeTextColorAnimation, mixColor, normalizeFrame, resolveStep, toHex };
