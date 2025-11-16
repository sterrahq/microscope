import { useState, useEffect } from "react";

import type { Middleware, PersistOptions } from "./types";
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
  } = options;

  let persistedValue: T = initial;

  if (!isSSR && typeof window !== "undefined") {
    try {
      const storeEngine =
        storage === "local" ? window.localStorage : window.sessionStorage;
      const saved = storeEngine.getItem(key);

      if (saved !== null) {
        persistedValue = deserialize(saved);
      }
    } catch {
      console.warn(`Failed to read persisted value for key "${key}"`);
    }
  }

  const persistMiddleware: Middleware<T> = (_prev, next) => {
    if (typeof window !== "undefined") {
      try {
        const storeEngine =
          storage === "local" ? window.localStorage : window.sessionStorage;

        storeEngine.setItem(key, serialize(next));
      } catch {
        console.warn(`Failed to persist value for key "${key}"`);
      }
    }

    return next;
  };

  const store = createValue(persistedValue, [persistMiddleware]);

  function useHydrate() {
    const [hydrated, setHydrated] = useState(!isSSR);

    useEffect(() => {
      if (!isSSR) return;

      try {
        const storeEngine =
          storage === "local" ? window.localStorage : window.sessionStorage;
        const saved = storeEngine.getItem(key);

        if (saved !== null) {
          const deserialized = deserialize(saved);

          store.set(deserialized);
        }
      } catch {
        console.warn(`Failed to read persisted value for key "${key}"`);
      }

      setHydrated(true);
    }, []);

    return hydrated;
  }

  return { store, useHydrate };
}
