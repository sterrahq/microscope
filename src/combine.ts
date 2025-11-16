import type { Store } from "./types";
import { createValue } from "./create-value";

export function combine<T extends any[], R>(
  stores: { [K in keyof T]: Store<T[K]> },
  combiner: (...values: T) => R
): Store<R> {
  const getValues = () => stores.map((s) => s.get()) as unknown as T;
  const combined = createValue(combiner(...getValues()));

  const update = () => {
    combined.set(combiner(...getValues()));
  };

  stores.forEach((s) => s.subscribe(update));

  return combined;
}
