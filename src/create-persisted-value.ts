import type { Middleware, PersistOptions, SyncStorageEngine } from "./types";
import { createValue } from "./create-value";

export function createPersistedValue<T>(
  key: string,
  initial: T,
  options: PersistOptions<T> = {}
) {
  const {
    storage = "local",
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    isSSR = false,
    middlewares = [],
  } = options;

  function getStorageEngine(): SyncStorageEngine | undefined {
    if (typeof storage === "object") {
      return storage;
    }

    if (typeof window === "undefined") {
      return undefined;
    }

    try {
      return storage === "local" ? window.localStorage : window.sessionStorage;
    } catch {
      return undefined;
    }
  }

  let persistedValue: T = initial;

  /**
   * Initial read:
   * - If isSSR is false, we can attempt to read browser storage (when running in browser).
   * - If isSSR is true, only attempt read if user provided a storage object (server shim).
   */
  const shouldAttemptInitialRead = !isSSR || typeof storage === "object";

  if (shouldAttemptInitialRead) {
    const engine = getStorageEngine();

    if (engine) {
      try {
        const saved = engine.getItem(key);

        if (saved !== null) {
          persistedValue = deserialize(saved);
        }
      } catch {
        console.warn(`Failed to read persisted value for key "${key}"`);
      }
    }
  }

  const persistMiddleware: Middleware<T> = (_prev, next) => {
    const engine = getStorageEngine();

    if (engine) {
      try {
        engine.setItem(key, serialize(next));
      } catch {
        console.warn(`Failed to persist value for key "${key}"`);
      }
    }

    return next;
  };

  const store = createValue(persistedValue, [
    persistMiddleware,
    ...middlewares,
  ]);

  /**
   * Hydration Method:
   */
  function hydrate() {
    const engine = getStorageEngine();

    if (engine) {
      try {
        const saved = engine.getItem(key);

        if (saved !== null) {
          const deserialized = deserialize(saved);
          store.set(deserialized);
        }
      } catch {
        console.warn(`Failed to read persisted value for key "${key}"`);
      }
    }
  }

  return { value: store, hydrate };
}
