import { devtools, persisted } from "@sterra/microscope";
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

export function createTodo(content: string) {
  todosValue.set((prev) => {
    prev.push({ id: Math.random(), content, done: false });
  });
}

export function toggleDone(id: number) {
  todosValue.set((prev) => {
    const todo = prev.find((todo) => todo.id === id);

    if (!todo) return;

    todo.done = !todo.done;
  });
}
