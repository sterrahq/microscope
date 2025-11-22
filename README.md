# Microscope 🔬

> Atomic state manager for React.

## Installation

```bash
npm install @sterra/microscope
# or
yarn add @sterra/microscope
# or
pnpm add @sterra/microscope
```

## Quick Start

### 1. Create a Store

Create a store anywhere in your app. It lives outside of React.

```ts
import { store } from "@sterra/microscope";

interface CounterState {
  count: number;
}

export const $counter = store<CounterState>({ count: 0 });
```

You can update it from anywhere (components, utils, etc.):

```ts
export const increment = () => {
  $counter.set((prev) => ({ count: prev.count + 1 }));
};
```

### 2. Use in React

Use the hook to subscribe to updates.

```tsx
import { useStore } from "@sterra/microscope";
import { $counter, increment } from "./stores/counter";

export function Counter() {
  // Select only what you need.
  // The component re-renders ONLY when the selected value changes.
  const count = useStore($counter, (state) => state.count);

  return <button onClick={increment}>Count is {count}</button>;
}
```

## Core Concepts

### Updating State

You can set state directly, use a functional updater, or perform shallow merges.

```ts
// Replace state
$store.set({ count: 10 });

// Update based on previous state
$store.set((prev) => ({ count: prev.count + 1 }));

// Shallow Merge (Patch)
// Useful for updating a single property in a large object
$store.patch({ count: 5 });
```

### Optimized Selectors

`useStore` accepts a selector and an optional equality function. It automatically handles memoization to ensure stable object references don't trigger re-renders.

```ts
// This component will NOT re-render if 'user.name' stays the same,
// even if other parts of the store (like 'user.age') update.
const userName = useStore($user, (state) => state.user.name);
```

## Utilities

Microscope comes with powerful built-in utilities to handle common state patterns.

### Persistence (`persisted`)

Automatically sync state with `localStorage` (or `sessionStorage`). This utility handles SSR safety and Cross-Tab Synchronization automatically.

```ts
import { persisted } from "@sterra/microscope";

export const $theme = persisted(
  "app-theme",
  { mode: "light" },
  {
    storage: "local", // or "session" or a custom engine
    skipHydration: false,
  }
);

// Usage is identical to a normal store
const theme = useStore($theme);
```

### Computed State (`derive`)

Create read-only stores that automatically update when their parent changes.

```ts
const $count = store({ val: 5 });

// $doubled will automatically update whenever $count changes
const $doubled = $count.derive((s) => s.val * 2);
```

### Combining Stores (`combine`)

Merge multiple stores into a single, reactive read-only stream.

```ts
import { store, combine } from "@sterra/microscope";

const $user = store({ name: "Alice" });
const $tasks = store({ list: [] });

// Combines updates from both stores
const $summary = combine([$user, $tasks], (user, tasks) => {
  return `${user.name} has ${tasks.list.length} tasks`;
});
```

## Middlewares

Microscope supports a robust middleware system that allows you to intercept, modify, or log state changes before they are committed to the store.

### How it works

A middleware is a function that receives the `previous` state, the `next` (proposed) state, and the `store` instance. It returns the final state to be saved.

```ts
type Middleware<T> = (prev: T, next: T, store: Store<T>) => T;
```

### Example: Logging Middleware

Here is a simple middleware that logs every state change to the console.

```ts
import { store, type Middleware } from "@sterra/microscope";

const logger: Middleware<any> = (prev, next) => {
  console.log("Previous:", prev);
  console.log("Next:", next);

  return next; // Return the state unchanged
};

const $counter = store({ count: 0 }, [logger]);

$counter.set({ count: 5 });
// Console:
// Previous: { count: 0 }
// Next: { count: 5 }
```

### Example: Validation & Data modification

You can use middleware to enforce rules, ensuring your state is always valid.

```ts
// Ensure the counter never goes below zero
const nonNegative: Middleware<{ count: number }> = (prev, next) => {
  if (next.count < 0) {
    console.warn("Counter cannot be negative. Reverting to 0.");

    return { ...next, count: 0 }; // Modify the state on the fly
  }

  return next;
};

const $counter = store({ count: 0 }, [nonNegative]);

$counter.set({ count: -5 });
console.log($counter.get()); // { count: 0 }
```

### Order of Execution

Middlewares run in the order they are passed to the `store`. The output of the first middleware becomes the `next` input of the second, forming a pipeline.

```ts
const $store = store(initial, [
  logger, // Runs first
  validator, // Runs second (receives input from logger)
  persisted, // Runs last (saves the final validated value)
]);
```

## Integrations

### Immer Support

If you prefer mutable syntax (e.g., `draft.push(...)`), you can use the official Immer integration.

#### Installation

```bash
npm install @sterra/microscope-immer immer
```

#### Usage

Wrap your store with `withImmer`.

```ts
import { store } from "@sterra/microscope";
import { withImmer } from "@sterra/microscope-immer";

const $todos = withImmer(store({ items: [] }));

// Now 'set' accepts a standard Immer producer
$todos.set((draft) => {
  // You can mutate the draft directly!
  draft.items.push({ id: 1, text: "Buy Milk" });
});
```
