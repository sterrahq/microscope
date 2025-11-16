import { createActions, devtools, persisted } from "@sterra/microscope";
import { withImmer } from "@sterra/microscope-immer";

interface TodoItem {
  id: number;
  content: string;
  done: boolean;
}

type TodoItems = Array<TodoItem>;

export const { value: _todosValue, hydrate } = persisted<TodoItems>(
  "microscope:todos",
  [
    {
      id: 1,
      content: "Buy some milk",
      done: false,
    },
  ],
  { isSSR: true, middlewares: [devtools()] }
);

export const todosValue = withImmer(_todosValue);

export const actions = createActions(todosValue, {
  createTodo(content: string) {
    return (prev) => {
      prev.push({ id: Math.random(), content, done: false });
    };
  },

  toggleDone(id: number) {
    return (prev) => {
      const todo = prev.find((todo) => todo.id === id);

      if (!todo) return;

      todo.done = !todo.done;
    };
  },
});
