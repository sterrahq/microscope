import type { PersistOptions } from "./types";
import { createPersistedValue } from "./create-persisted-value";

export function persisted<T>(
  key: string,
  initial: T,
  options: PersistOptions<T> = {}
) {
  return createPersistedValue(key, initial, options);
}
