export type StateUpdater<T> = T | ((prev: T) => T) | ((prev: T) => void);
export type Listener<T> = (state: T) => void;
export type Selector<T, S> = (state: T) => S;
export type EqualityFn<S> = (a: S, b: S) => boolean;
export type PatchUpdater<T> = Partial<T> | ((prev: T) => Partial<T>);

export type Middleware<T> = (prev: T, next: T, store: Store<T>) => T;

export interface Store<T> {
  get(): T;
  set(updater: StateUpdater<T>): void;
  subscribe(listener: Listener<T>): () => void;
  derive<S>(
    selector: Selector<T, S>,
    equalityFn?: EqualityFn<S>
  ): ReadonlyStore<S>;
  patch(updaters: PatchUpdater<T>): void;
}

export type PersistedStore<T> = Store<T> & {
  hydrate(): void;
};

export type ReadonlyStore<T> = Omit<Store<T>, "set" | "patch">;

export interface SyncStorageEngine {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type StorageType = "local" | "session";

export interface PersistOptions<T> {
  storage?: StorageType | SyncStorageEngine;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  skipHydration?: boolean;
  middlewares?: Array<Middleware<T>>;
}
