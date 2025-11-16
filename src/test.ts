import { value } from "./value";
import { createActions } from "./create-actions";

const num = value(0);

const actions = createActions(num, {
  increment() {
    return (prev) => prev + 1;
  },

  async incrementAsync() {
    await new Promise((r) => setTimeout(r, 1000));
    return (prev) => prev + 1;
  },
});

(async () => {
  console.log("01 => ", num.get());

  actions.increment();

  console.log("02 => ", num.get());

  await actions.incrementAsync();

  console.log("03 => ", num.get());

  actions.incrementAsync().then(() => {
    console.log("04 => ", num.get());
  });

  actions.increment();

  console.log("05 => ", num.get());

  actions.increment();

  console.log("06 => ", num.get());
})();
