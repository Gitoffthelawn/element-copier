var DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS = 300;

function shouldSuppressContentToggleAfterToggleCommand(lastAt, now, windowMs = DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS) {
  return lastAt > 0 && now - lastAt < windowMs;
}

function createToggleCommandSuppressTracker(windowMs = DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS) {
  let lastToggleCommandAt = 0;
  return {
    stampToggleCommand: () => {
      lastToggleCommandAt = Date.now();
    },
    shouldSuppressContentToggle: (now = Date.now()) => shouldSuppressContentToggleAfterToggleCommand(
      lastToggleCommandAt,
      now,
      windowMs
    ),
    shouldSuppressToolbarClick: (now = Date.now()) => shouldSuppressContentToggleAfterToggleCommand(
      lastToggleCommandAt,
      now,
      windowMs
    )
  };
}

export { DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS, createToggleCommandSuppressTracker, shouldSuppressContentToggleAfterToggleCommand };
