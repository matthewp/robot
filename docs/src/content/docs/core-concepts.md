---
title: Core Concepts
tags: core
---

# Core Concepts

Robot is built around finite state machines (FSMs). Understanding these core concepts will help you build more predictable and maintainable applications.

## What Are Finite State Machines?

A finite state machine is a mathematical model of computation that can be in exactly one state at any given time. The machine can change from one state to another in response to events. This change is called a transition.

FSMs have been around since the 1950s and are used everywhere - from traffic lights to complex software systems. They provide a structured way to model behavior that involves distinct modes or phases.

## The Five Core Concepts

Robot's state machines are built on five fundamental concepts:

### [State](/docs/concepts-state/)

States represent the different modes or conditions your application can be in. At any given time, your machine is in exactly one state.

```js
const machine = createMachine({
  idle: state(),
  loading: state(),
  loaded: state(),
  error: state()
});
```

**Learn more**: [Understanding State](/docs/concepts-state/)

### [Transitions](/docs/concepts-transitions/)

Transitions define how your machine moves from one state to another in response to events. They're the pathways that connect your states.

```js
idle: state(
  transition('fetch', 'loading')
),
loading: state(
  transition('success', 'loaded'),
  transition('error', 'error')
)
```

**Learn more**: [Understanding Transitions](/docs/concepts-transitions/)

### [Events](/docs/concepts-events/)

Events are the triggers that cause state transitions. They represent things that happen - user interactions, API responses, timers, or any occurrence that should cause your machine to change state.

```js
const service = interpret(machine);

// Send events to trigger transitions
service.send('fetch');
service.send({ type: 'success', data: users });
```

**Learn more**: [Understanding Events](/docs/concepts-events/)

### [Guards](/docs/concepts-guards/)

Guards are conditions that must be met for a transition to occur. They let you add conditional logic to your state machines without complicating the state structure.

```js
idle: state(
  transition('submit', 'processing',
    guard((ctx) => ctx.form.isValid)
  )
)
```

**Learn more**: [Understanding Guards](/docs/concepts-guards/)

### [Actions](/docs/concepts-actions/)

Actions are side effects that occur during transitions. They let you update context, make API calls, update the DOM, or perform any other effects.

```js
idle: state(
  transition('login', 'authenticated',
    reduce((ctx, ev) => ({ ...ctx, user: ev.user }))
  )
)
```

**Learn more**: [Understanding Actions](/docs/concepts-actions/)

## Why Use Finite State Machines?

### Eliminate Invalid States

Without FSMs, applications often use multiple booleans that can create impossible combinations:

```js
// Without FSM - invalid states possible ❌
let loading = false;
let loaded = false;
let error = false;

// What does this mean?
loading = true;
loaded = true;
```

With FSMs, you're always in exactly one valid state:

```js
// With FSM - always valid ✅
const machine = createMachine({
  idle: state(),
  loading: state(),
  loaded: state(),
  error: state()
});
```

### Make Behavior Explicit

FSMs make your application's behavior self-documenting:

```js
const authMachine = createMachine({
  loggedOut: state(
    transition('login', 'authenticating')
  ),
  authenticating: state(
    transition('success', 'loggedIn'),
    transition('failure', 'loggedOut')
  ),
  loggedIn: state(
    transition('logout', 'loggedOut')
  )
});
```

Just by reading the machine, you can see every possible state and how they connect.

### Prevent Unexpected Behavior

Only defined transitions can occur. You can't accidentally jump from `idle` to `loaded` if you didn't define that transition.

### Enable Better Testing

With explicit states and transitions, you can test every path through your application systematically.

## Putting It All Together

Here's a complete example using all core concepts:

```js
import { createMachine, state, transition, guard, action, interpret } from 'robot3';

// Actions
const setUser = action((ctx, event) => ({ ...ctx, user: event.data }));
const clearError = action((ctx) => ({ ...ctx, error: null }));
const setError = action((ctx, event) => ({ ...ctx, error: event.error }));

// Guards
const isValid = guard((ctx, event) => event.data && event.data.email);

// Machine definition
const machine = createMachine({
  idle: state(
    transition('fetch', 'loading', clearError)
  ),
  loading: state(
    transition('success', 'loaded',
      guard(isValid),
      setUser
    ),
    transition('failure', 'error', setError)
  ),
  loaded: state(
    transition('refresh', 'loading')
  ),
  error: state(
    transition('retry', 'loading', clearError)
  )
}, {
  user: null,
  error: null
});

// Create and use service
const service = interpret(machine, () => {
  console.log('Current state:', service.machine.current);
  console.log('Context:', service.context);
});

// Trigger transitions
service.send('fetch');
service.send({ type: 'success', data: { email: 'user@example.com' } });
```

This example demonstrates:
- **States**: Four distinct states (idle, loading, loaded, error)
- **Transitions**: Movement between states based on events
- **Events**: Different triggers (fetch, success, failure, retry)
- **Guards**: Validation before allowing transitions
- **Actions**: Context updates and side effects

## Next Steps

Now that you understand the core concepts, you can:

1. **Dive deeper**: Read the detailed guides for each concept
   - [Understanding State](/docs/concepts-state/)
   - [Understanding Transitions](/docs/concepts-transitions/)
   - [Understanding Events](/docs/concepts-events/)
   - [Understanding Guards](/docs/concepts-guards/)
   - [Understanding Actions](/docs/concepts-actions/)

2. **Explore the API**: Check out the API reference for implementation details
   - [createMachine](/docs/createmachine/)
   - [state](/docs/state/)
   - [transition](/docs/transition/)
   - [guard](/docs/guard/)
   - [action](/docs/action/)

3. **Learn patterns**: See how to apply these concepts in real applications
   - [Composition](/docs/composition/)
   - [Nested States](/docs/nested-states/)
   - [Async Execution](/docs/awaiting-asynchronous-execution/)

4. **Integrate with frameworks**: Use Robot with your favorite UI library
   - [React Robot](/docs/react-robot/)
   - [Preact Robot](/docs/preact-robot/)
   - [Svelte Robot](/docs/svelte-robot-factory/)
   - [Lit Robot](/docs/lit-robot/)

These core concepts form the foundation of Robot's state management. Master these, and you'll be able to model complex application behavior in a clear, maintainable way.
