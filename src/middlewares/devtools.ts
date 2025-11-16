import type { Middleware, Store } from "../types";

export function devtools<T>(name = "Store"): Middleware<T> {
  let extension: any;
  let devtools: any;
  let isTimeTraveling = false;

  return (prev, next, store, actionName) => {
    if (!extension) {
      extension =
        (window as any).__REDUX_DEVTOOLS_EXTENSION__ ||
        (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE;

      if (extension) {
        devtools = extension.connect({ name });

        devtools.init(store.get());

        devtools.subscribe((msg: any) => {
          if (msg.type === "DISPATCH") {
            switch (msg.payload.type) {
              case "JUMP_TO_STATE":
              case "JUMP_TO_ACTION": {
                isTimeTraveling = true;

                const state = JSON.parse(msg.state);

                store.set(state, "time-travel");

                break;
              }
            }
          }
        });
      }
    }

    if (isTimeTraveling) {
      isTimeTraveling = false;

      return next;
    }

    devtools?.send({ type: actionName ?? "set", payload: next }, next);

    return next;
  };
}
