import { useState } from "react";

import { todosValue, createTodo, toggleDone } from "./store";

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
  const todos = todosValue.use();

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
  return (
    <>
      <h1>Microscopic Todos</h1>
      <Todos />
      <AddForm />
    </>
  );
}

export default App;
