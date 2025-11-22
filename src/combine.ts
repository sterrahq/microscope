import type { ReadonlyStore, Store } from "./types";
import { store } from "./store";

export type DisposableStore<T> = ReadonlyStore<T> & { destroy: () => void };

export function combine<T extends unknown[], R>(
  stores: { [K in keyof T]: Store<T[K]> },
  combiner: (...values: T) => R
): DisposableStore<R> {
  const getValues = () => stores.map((s) => s.get()) as unknown as T;

  const initialValue = combiner(...getValues());
  const combinedStore = store<R>(initialValue);

  const update = () => {
    combinedStore.set(combiner(...getValues()));
  };

  const unsubs = stores.map((s) => s.subscribe(update));

  const destroy = () => unsubs.forEach((unsub) => unsub());

  return {
    get: combinedStore.get,
    subscribe: combinedStore.subscribe,
    derive: combinedStore.derive,
    destroy,
  };
}
