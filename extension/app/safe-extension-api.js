function normalizeSafeExtensionApiIgnoredErrors(sources) {
  const sourceList = Array.isArray(sources) ? sources : [sources];
  const normalized = {};
  for (const source of sourceList) {
    if (!source) continue;
    for (const [method, rule] of Object.entries(source)) {
      if (!rule?.messages?.length) continue;
      const current = normalized[method];
      normalized[method] = {
        messages: current ? [...current.messages, ...rule.messages] : [...rule.messages],
        fallback: Object.prototype.hasOwnProperty.call(rule, "fallback") ? rule.fallback : current?.fallback,
      };
    }
  }
  return normalized;
}
function shouldIgnoreExtensionApiError(ignoredErrors, method, err) {
  const rule = ignoredErrors[method];
  if (!rule) return false;
  const message = String(err instanceof Error ? err.message : err?.message ?? err);
  return rule.messages.some((expected) => message.includes(expected));
}
function chromeRuntimeLastErrorMessage() {
  return globalThis.chrome?.runtime?.lastError?.message;
}
function resolveIgnoredOrThrow(ignoredErrors, method, rule, err, resolve, reject) {
  if (shouldIgnoreExtensionApiError(ignoredErrors, method, err)) {
    resolve(rule.fallback);
    return;
  }
  reject(err instanceof Error ? err : new Error(String(err?.message ?? err)));
}
function safeExtensionApiMethod(
  ignoredErrors,
  method,
  target,
  fn,
  useChromeLastErrorBridge = false,
) {
  const rule = ignoredErrors[method];
  return function (...args) {
    if (useChromeLastErrorBridge && typeof args[args.length - 1] !== "function") {
      return new Promise((resolve, reject) => {
        try {
          fn.call(target, ...args, (value) => {
            const message = chromeRuntimeLastErrorMessage();
            if (message) {
              resolveIgnoredOrThrow(ignoredErrors, method, rule, message, resolve, reject);
              return;
            }
            resolve(value);
          });
        } catch (err) {
          resolveIgnoredOrThrow(ignoredErrors, method, rule, err, resolve, reject);
        }
      });
    }
    try {
      const result = fn.apply(target, args);
      if (!result?.then) return result;
      return result.catch((err) => {
        if (shouldIgnoreExtensionApiError(ignoredErrors, method, err)) {
          return rule.fallback;
        }
        throw err;
      });
    } catch (err) {
      if (shouldIgnoreExtensionApiError(ignoredErrors, method, err)) {
        return rule.fallback;
      }
      throw err;
    }
  };
}
function createSafeExtensionApi(base, ignoredErrors) {
  const normalizedIgnoredErrors = normalizeSafeExtensionApiIgnoredErrors(ignoredErrors);
  const useChromeLastErrorBridge = base === globalThis.chrome;
  const namespaceCache = new Map();
  return new Proxy(base, {
    get(target, namespace, receiver) {
      const value = Reflect.get(target, namespace, receiver);
      if (!value || typeof value !== "object") return value;
      if (namespaceCache.has(namespace)) return namespaceCache.get(namespace);
      const wrapped = new Proxy(value, {
        get(namespaceTarget, method, methodReceiver) {
          const methodValue = Reflect.get(namespaceTarget, method, methodReceiver);
          const methodKey = `${String(namespace)}.${String(method)}`;
          if (typeof methodValue === "function" && normalizedIgnoredErrors[methodKey]) {
            return safeExtensionApiMethod(
              normalizedIgnoredErrors,
              methodKey,
              namespaceTarget,
              methodValue,
              useChromeLastErrorBridge,
            );
          }
          return methodValue;
        },
      });
      namespaceCache.set(namespace, wrapped);
      return wrapped;
    },
  });
}

export { createSafeExtensionApi };
