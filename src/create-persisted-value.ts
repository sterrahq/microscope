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
    if (typeof options.storage === "object") {
      return options.storage;
    }

    if (isSSR || typeof window === "undefined") {
      return undefined;
    }

    try {
      return options.storage === "local"
        ? window.localStorage
        : window.sessionStorage;
    } catch {
      return undefined;
    }
  }

  let persistedValue: T = initial;

  /**
   * Initial Read:
   */
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
