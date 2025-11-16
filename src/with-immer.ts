import { produce } from "immer";
import { Store } from "./types";

type ImmerSet<T> = (updaters: T | ((draft: T) => void)) => void;

export function withImmer<T>(store: Store<T>): Store<T> {
  const immerSet: ImmerSet<T> = (updater) => {
    if (typeof updater !== "function") {
      store.set(updater);
      return;
    }

    const producer = updater as (draft: T) => void;
    const currentState = store.get();
    const nextState = produce(currentState, producer);

    store.set(nextState);
  };

  return { ...store, set: immerSet };
}
