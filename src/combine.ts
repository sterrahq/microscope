import type { ReadonlyStore, Store } from "./types";
import { store } from "./store";

export function combine<T extends unknown[], R>(
  stores: { [K in keyof T]: Store<T[K]> },
  combiner: (...values: T) => R
): ReadonlyStore<R> {
  const getValues = () => stores.map((s) => s.get()) as unknown as T;

  const initialValue = combiner(...getValues());
  const combinedStore = store<R>(initialValue);

  const update = () => {
    combinedStore.set(combiner(...getValues()));
  };

  stores.forEach((s) => s.subscribe(update));

  return {
    get: combinedStore.get,
    subscribe: combinedStore.subscribe,
    derive: combinedStore.derive,
  };
}
