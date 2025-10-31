---
title: Understanding State
tags: concept
---

# Understanding State

States are the foundation of any finite state machine. At any given time, your machine is in exactly one state. States represent the different modes or conditions your application can be in.

In traditional programming, we often use boolean flags or multiple variables to track application state. This can lead to invalid state combinations and bugs. With finite state machines, you explicitly define all possible states, making your application's behavior predictable and easy to reason about.

## Defining States

In Robot, states are created using the `state` function and organized within a machine:

```js
import { createMachine, state } from 'robot3';

const machine = createMachine({
  idle: state(),
  loading: state(),
  loaded: state(),
  error: state()
});
```

States in Robot are declarative - you define what states exist and what transitions are possible from each state. This makes your application's behavior predictable and easy to reason about.

## Initial State

Every machine starts in an initial state. By default, this is the first state defined in your machine:

```js
const machine = createMachine({
  idle: state(),      // This is the initial state
  active: state()
});
```

You can also explicitly specify the initial state:

```js
const machine = createMachine('active', {
  idle: state(),
  active: state()     // Machine starts here
});
```

## Final States

States with no transitions are considered final states. When a machine reaches a final state, it stays there unless externally reset:

```js
const machine = createMachine({
  processing: state(
    transition('complete', 'finished')
  ),
  finished: state()   // Final state - no way out
});
```

Final states are useful for representing completed workflows, terminated processes, or end conditions in your application logic.

## State Names

State names should be:
- **Descriptive**: Choose names that clearly describe what the state represents
- **Unique**: Each state must have a unique name within a machine
- **Verb or noun form**: Use names like `loading`, `idle`, `authenticated` rather than `isLoading`, `shouldLoad`

```js
// Good state names
const machine = createMachine({
  idle: state(),
  authenticating: state(),
  authenticated: state(),
  failed: state()
});

// Avoid boolean-style names
const machine = createMachine({
  isIdle: state(),           // ❌ Don't prefix with 'is'
  hasAuthenticated: state(), // ❌ Don't prefix with 'has'
  shouldRetry: state()       // ❌ Don't prefix with 'should'
});
```

## Why States Matter

### Eliminating Invalid States

Without explicit states, applications often use multiple booleans that can create impossible combinations:

```js
// Without FSM - invalid states possible
let loading = false;
let loaded = false;
let error = false;

// What does this mean? ❌
loading = true;
loaded = true;
error = true;
```

With finite state machines, you can only be in one state at a time:

```js
// With FSM - always valid ✅
const machine = createMachine({
  idle: state(),
  loading: state(),
  loaded: state(),
  error: state()
});
// Machine is in exactly ONE state
```

### Making State Explicit

Explicit states make your code self-documenting. Instead of scattered conditional logic, your states are clearly defined:

```js
// Without FSM - implicit state
function handleClick() {
  if (!loading && !error && data === null) {
    // What state are we in? 🤔
    fetchData();
  }
}

// With FSM - explicit state ✅
const machine = createMachine({
  idle: state(
    transition('fetch', 'loading')
  ),
  loading: state(
    transition('success', 'loaded'),
    transition('error', 'error')
  ),
  loaded: state(),
  error: state()
});
```

## State vs Context

It's important to distinguish between **state** (which mode you're in) and **context** (the data associated with that state):

- **State**: The current mode or phase (e.g., `loading`, `idle`, `error`)
- **Context**: Data that persists across states (e.g., user info, error messages, counters)

```js
const machine = createMachine({
  idle: state(
    transition('fetch', 'loading')
  ),
  loading: state(
    transition('success', 'loaded')
  ),
  loaded: state()
}, () => ({
  // This is context - data that can change
  users: [],
  errorMessage: null,
  retryCount: 0
}));
```

States tell you *where* you are in your application flow. Context tells you *what* data you have while you're there.

## Related Topics

- [Transitions](/docs/concepts-transitions/) - How to move between states
- [Events](/docs/concepts-events/) - What triggers state changes
- [state API](/docs/state/) - Technical reference for the state function
