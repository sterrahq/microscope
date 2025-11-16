import "./App.css";

import { value } from "microscope";

const counter = value(0);

function App() {
  const count = counter.use();
  const increment = () => counter.set((prev) => prev + 1);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={increment}>count is {count})</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
