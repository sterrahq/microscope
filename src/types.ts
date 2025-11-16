export type StateUpdater<T> = T | ((prev: T) => T);
export type Listener<T> = (state: T) => void;
export type Selector<T, S> = (state: T) => S;
export type EqualityFn<S> = (a: S, b: S) => boolean;
export type Middleware<T> = (prev: T, next: T) => T;

export interface Store<T> {
  get(): T;
  set(updater: StateUpdater<T>): void;
  setAsync(updater: (prev: T) => Promise<T>): Promise<void>;
  patch(updater: Partial<T>): void;
  subscribe(listener: Listener<T>): () => void;
  use<S = T>(selector?: Selector<T, S>, equalityFn?: EqualityFn<S>): S;
  derive<S>(selector: Selector<T, S>, equalityFn?: EqualityFn<S>): Store<S>;
}

export type StorageType = "local" | "session";

export interface PersistOptions<T> {
  storage?: StorageType;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  isSSR?: boolean;
}
