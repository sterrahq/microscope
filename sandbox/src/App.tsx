import { useEffect, useState } from "react";

import { $todos, createTodo, toggleDone } from "./store";
import { useStore } from "@sterra/microscope";

function AddForm() {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!value.trim()) return;

    createTodo(value.trim());
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

function Todos() {
  const todos = useStore($todos);

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

function App() {
  useEffect(() => {
    $todos.hydrate();
  }, []);

  return (
    <>
      <h1>Microscopic Todos</h1>
      <Todos />
      <AddForm />
    </>
  );
}

export default App;
