import type { Store, Selector, EqualityFn } from "./types";

export function useStore<T, S = T>(
  store: Store<T>,
  selector?: Selector<T, S>,
  equalityFn?: EqualityFn<S>
) {
  return store.use(selector, equalityFn);
}
