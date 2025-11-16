import { StateUpdater, Store } from "./types";

type ActionMap<T> = Record<
  string,
  (...args: any[]) => StateUpdater<T> | Promise<StateUpdater<T>>
>;

export function createActions<T, A extends ActionMap<T>>(
  store: Store<T>,
  actions: A
): {
  [K in keyof A]: ReturnType<A[K]> extends Promise<any>
    ? (...args: Parameters<A[K]>) => Promise<void>
    : (...args: Parameters<A[K]>) => void;
} {
  const wrapped = {} as {
    [K in keyof A]: ReturnType<A[K]> extends Promise<any>
      ? (...args: Parameters<A[K]>) => Promise<void>
      : (...args: Parameters<A[K]>) => void;
  };

  for (const key of Object.keys(actions) as Array<keyof A>) {
    wrapped[key] = ((...args: any[]) => {
      const result = actions[key](...args);

      if (result instanceof Promise) {
        return result.then((updater) => store.set(updater, key as string));
      } else {
        store.set(result, key as string);
      }
    }) as any;
  }

  return wrapped;
}
