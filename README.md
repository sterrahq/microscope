# Microscope 🔬

> Atomic state manager for React.

Check on [npm](https://npmjs.com/package/@sterra/microscope)!

## Install

**npm:**

```bash
npm install @sterra/microscope
```

## Usage

```tsx
import { useState } from "react";

import { value, useValue } from "@sterra/microscope";

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

/**
 * Define an atomic store:
 */
const todosValue = value<Todo[]>([]);

/**
 * Define actions:
 */
function addTodo(text: string) {
  const newTodo: Todo = {
    id: crypto.randomUUID(),
    done: false,
    text,
  };

  todosValue.set((prev) => [...prev, newTodo]);
}

function toggleDone(id: string) {
  todosValue.set((prev) =>
    prev.map((todo) => {
      if (todo.id !== id) return todo;

      return { ...todo, done: !todo.done };
    })
  );
}

/**
 * A form to add a todo:
 */
function Form() {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    if (!value.trim()) return;

    addTodo(value);

    setValue("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
    </form>
  );
}

/**
 * A component to list the todos:
 */
function Todos() {
  const todos = useValue(todosValue);

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input
            id={`todo-${todo.id}`}
            type="checkbox"
            onChange={() => toggleDone(todo.id)}
            checked={todo.done}
          />

          <label
            htmlFor={`todo-${todo.id}`}
            style={{ textDecoration: todo.done ? "line-through" : "none" }}
          >
            {todo.content}
          </label>
        </li>
      ))}
    </ul>
  );
}

export function App() {
  return (
    <div>
      <h1>Microscopic Todos</h1>

      <Todos />
      <Form />
    </div>
  );
}
```
