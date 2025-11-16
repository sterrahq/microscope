import { StateUpdater, Store } from "./types";

type ActionMap<T> = Record<string, (...args: any[]) => StateUpdater<T>>;

export function createActions<T, A extends ActionMap<T>>(
  store: Store<T>,
  actions: A
): {
  [K in keyof A]: (...args: Parameters<A[K]>) => void;
} {
  const wrapped: Partial<Record<keyof A, (...args: any[]) => void>> = {};

  for (const key of Object.keys(actions) as Array<keyof A>) {
    wrapped[key] = ((...args: any[]) => {
      const updater = actions[key](...args);

      store.set(updater, key as string);
    }) as (...args: Parameters<A[typeof key]>) => void;
  }

  return wrapped as { [K in keyof A]: (...args: Parameters<A[K]>) => void };
}
