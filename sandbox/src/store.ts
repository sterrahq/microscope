import { persisted } from "@sterra/microscope";
import { withImmer } from "@sterra/microscope-immer";

interface TodoItem {
  id: number;
  content: string;
  done: boolean;
}

type TodoItems = Array<TodoItem>;

export const $todos = withImmer(
  persisted<TodoItems>(
    "microscope:todos",
    [
      {
        id: 1,
        content: "Buy some milk",
        done: false,
      },
    ],
    { skipHydration: true }
  )
);

export function createTodo(content: string) {
  $todos.set((prev) => {
    prev.push({ id: Math.random(), content, done: false });
  });
}

export function toggleDone(id: number) {
  $todos.set((prev) => {
    const todo = prev.find((todo) => todo.id === id);

    if (!todo) return;

    todo.done = !todo.done;
  });
}
