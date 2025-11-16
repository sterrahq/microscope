import { value } from "microscope";

interface TodoItem {
  id: number;
  content: string;
  done: boolean;
}

type TodoItems = Array<TodoItem>;

export const todosValue = value<TodoItems>([
  {
    id: 1,
    content: "Buy some milk",
    done: false,
  },
]);

export function createTodo(content: string) {
  const id = Math.random();

  todosValue.set((prev) => [...prev, { id, content, done: false }]);
}

export function toggleDone(id: number) {
  todosValue.set((prev) =>
    prev.map((todo) => {
      if (todo.id !== id) return todo;

      return { ...todo, done: !todo.done };
    })
  );
}
