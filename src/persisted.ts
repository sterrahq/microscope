import type {
  Middleware,
  PersistedStore,
  PersistOptions,
  SyncStorageEngine,
} from "./types";

import { store } from "./store";

export function persisted<T>(
  key: string,
  initial: T,
  options: PersistOptions<T> = {}
): PersistedStore<T> {
  const {
    storage = "local",
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    skipHydration = false,
    middlewares = [],
  } = options;

  function getStorageEngine(): SyncStorageEngine | undefined {
    if (typeof storage === "object") return storage;

    if (typeof window === "undefined") return undefined;

    try {
      return storage === "local" ? window.localStorage : window.sessionStorage;
    } catch {
      return undefined;
    }
  }

  let persistedValue: T = initial;

  const canHydrate = !skipHydration && typeof window !== "undefined";

  if (canHydrate) {
    const engine = getStorageEngine();
    if (engine) {
      try {
        const saved = engine.getItem(key);

        if (saved !== null) {
          persistedValue = deserialize(saved);
        }
      } catch (e) {
        console.warn(`Error reading key "${key}":`, e);
      }
    }
  }

  const persistMiddleware: Middleware<T> = (_prev, next) => {
    const engine = getStorageEngine();

    if (engine) {
      try {
        engine.setItem(key, serialize(next));
      } catch (e) {
        console.warn(`Error writing key "${key}":`, e);
      }
    }
    return next;
  };

  const persistedStore = store(persistedValue, [
    ...middlewares,
    persistMiddleware,
  ]);

  /**
   * Cross-Tab Synchronization
   */
  if (typeof window !== "undefined" && storage === "local") {
    window.addEventListener("storage", (e) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = deserialize(e.newValue);

          persistedStore.set(newValue);
        } catch (error) {
          console.error("Failed to sync storage change", error);
        }
      }
    });
  }

  function hydrate() {
    const engine = getStorageEngine();
    if (!engine) return;

    try {
      const saved = engine.getItem(key);
      if (saved !== null) {
        persistedStore.set(deserialize(saved));
      }
    } catch (e) {
      console.warn(`Error hydrating key "${key}":`, e);
    }
  }

  return {
    ...persistedStore,
    hydrate,
  };
}
