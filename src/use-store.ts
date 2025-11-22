import { useRef, useCallback, useSyncExternalStore } from "react";
import { Selector, EqualityFn, Store } from "./types";
import { shallowEqual } from "./utils";

export function useStore<T, S = T>(
  store: Store<T>,
  selector?: Selector<T, S>,
  equalityFn: EqualityFn<S> = shallowEqual
): S {
  const selectorRef = useRef(selector);
  const equalityFnRef = useRef(equalityFn);

  selectorRef.current = selector;
  equalityFnRef.current = equalityFn;

  const sel = useCallback((state: T) => {
    const s = selectorRef.current;

    return s ? s(state) : (state as unknown as S);
  }, []);

  const lastStateRef = useRef<T | null>(null);
  const lastSelectionRef = useRef<S | null>(null);

  const currentState = store.get();

  if (lastSelectionRef.current === null && lastStateRef.current === null) {
    lastSelectionRef.current = sel(currentState);
    lastStateRef.current = currentState;
  }

  const getSnapshot = useCallback(() => {
    const nextState = store.get();
    const prevSelection = lastSelectionRef.current as S;

    if (Object.is(nextState, lastStateRef.current)) {
      return prevSelection;
    }

    const nextSelection = sel(nextState);

    if (equalityFnRef.current(prevSelection, nextSelection)) {
      lastStateRef.current = nextState;

      return prevSelection;
    }

    lastStateRef.current = nextState;
    lastSelectionRef.current = nextSelection;

    return nextSelection;
  }, [store, sel]);

  return useSyncExternalStore(
    store.subscribe,
    getSnapshot,
    () => lastSelectionRef.current as S
  );
}
