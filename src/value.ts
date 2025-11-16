import type { Middleware, Store } from "./types";

import { createValue } from "./create-value";

export function value<T>(
  initial: T,
  middlewares: Array<Middleware<T>> = []
): Store<T> {
  return createValue(initial, middlewares);
}
