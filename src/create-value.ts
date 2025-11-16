import { useSyncExternalStore, useRef } from "react";

import type {
  Middleware,
  Store,
  Listener,
  StateUpdater,
  Selector,
  EqualityFn,
  PatchUpdater,
} from "./types";

import { shallowEqual } from "./utils";

export function createValue<T>(
  initial: T,
  middlewares: Array<Middleware<T>> = []
): Store<T> {
  let state = typeof initial === "function" ? (initial as () => T)() : initial;

  const listeners = new Set<Listener<T>>();

  const store: Store<T> = {
    get,
    set,
    patch,
    subscribe,
    use,
    derive,
  };

  function applyMiddlewares(prev: T, next: T, debugLabel?: string) {
    return middlewares.reduce(
      (acc, fn) => fn(prev, acc, store, debugLabel),
      next
    );
  }

  function get() {
    return state;
  }

  function set(updater: StateUpdater<T>, debugLabel?: string) {
    const nextState =
      typeof updater === "function"
        ? (updater as (prev: T) => T)(state)
        : updater;

    if (Object.is(state, nextState)) return;

    const finalState = applyMiddlewares(state, nextState, debugLabel);

    if (!Object.is(state, finalState)) {
      state = finalState;
      listeners.forEach((l) => l(state));
    }
  }

  function patch(updater: PatchUpdater<T>, debugLabel?: string) {
    if (typeof state !== "object" || state === null) {
      throw new Error("Cannot patch primitive state");
    }

    const partial =
      typeof updater === "function"
        ? (updater as (prev: T) => Partial<T>)(state)
        : updater;

    set({ ...state, ...partial }, debugLabel);
  }

  function subscribe(listener: Listener<T>) {
    listeners.add(listener);

    return () => listeners.delete(listener);
  }

  function use<S = T>(
    selector?: Selector<T, S>,
    equalityFn: EqualityFn<S> = shallowEqual
  ) {
    const sel = selector ?? ((s: T) => s as unknown as S);
    const lastValueRef = useRef(sel(state));

    return useSyncExternalStore(
      subscribe,
      () => {
        const selected = sel(state);
        if (!equalityFn(lastValueRef.current, selected)) {
          lastValueRef.current = selected;
        }
        return lastValueRef.current;
      },
      () => lastValueRef.current
    );
  }

  function derive<S>(
    selector: Selector<T, S>,
    equalityFn: EqualityFn<S> = shallowEqual
  ): Store<S> {
    let cached: S = selector(state);
    const derivedStore = createValue<S>(cached);

    subscribe((nextState) => {
      const newValue = selector(nextState);

      if (!equalityFn(cached, newValue)) {
        cached = newValue;
        derivedStore.set(cached);
      }
    });

    return derivedStore;
  }

  return store;
}
