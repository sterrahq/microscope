import { value, withImmer } from "microscope";

interface TodoItem {
  id: number;
  content: string;
  done: boolean;
}

type TodoItems = Array<TodoItem>;

export const todosValue = withImmer(
  value<TodoItems>([
    {
      id: 1,
      content: "Buy some milk",
      done: false,
    },
  ])
);

todosValue.set([]);

export function createTodo(content: string) {
  const id = Math.random();

  todosValue.set((prev) => {
    prev.push({ id, content, done: false });
  });
}

export function toggleDone(id: number) {
  todosValue.set((prev) => {
    const todo = prev.find((todo) => todo.id === id);

    if (!todo) return;

    todo.done = !todo.done;
  });
}
