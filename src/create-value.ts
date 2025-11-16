import { useSyncExternalStore, useRef } from "react";

import type {
  Middleware,
  Store,
  Listener,
  StateUpdater,
  Selector,
  EqualityFn,
} from "./types";

import { shallowEqual } from "./utils";

export function createValue<T>(
  initial: T,
  middlewares: Array<Middleware<T>> = []
): Store<T> {
  let state = typeof initial === "function" ? (initial as () => T)() : initial;
  const listeners = new Set<Listener<T>>();

  const applyMiddlewares = (prev: T, next: T) => {
    return middlewares.reduce((acc, fn) => fn(prev, acc), next);
  };

  const get = () => state;

  const set = (updater: StateUpdater<T>) => {
    const nextState =
      typeof updater === "function"
        ? (updater as (prev: T) => T)(state)
        : updater;

    const finalState = applyMiddlewares(state, nextState);

    if (!Object.is(state, finalState)) {
      state = finalState;
      listeners.forEach((l) => l(state));
    }
  };

  const setAsync = async (updater: (prev: T) => Promise<T>) => {
    const nextState = await updater(state);

    set(nextState);
  };

  const patch = (partial: Partial<T>) => {
    if (typeof state !== "object" || state === null) {
      throw new Error("Cannot patch primitive state");
    }

    set({ ...state, ...partial });
  };

  const subscribe = (listener: Listener<T>) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

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

  return { get, set, setAsync, patch, subscribe, use, derive };
}
