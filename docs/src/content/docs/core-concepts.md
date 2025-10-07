---
title: Core Concepts
tags: core
permalink: core/concepts.html
---

Robot is built around finite state machines. Understanding these core concepts will help you build more predictable and maintainable applications.

## STATE

<span id="state"></span>

States are the foundation of any state machine. At any given time, your machine is in exactly one state. States represent the different modes or conditions your application can be in.

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

### Initial State

Every machine starts in the first state defined. In the example above, the machine begins in the `idle` state.

### Final States

States with no transitions are considered final states. When a machine reaches a final state, it stays there unless externally reset.

## TRANSITIONS

<span id="transitions"></span>

Transitions define how your machine moves from one state to another in response to events. They're the arrows in your state diagram.

```js
import { createMachine, state, transition } from 'robot3';

const machine = createMachine({
  idle: state(
    transition('fetch', 'loading')
  ),
  loading: state(
    transition('done', 'loaded'),
    transition('error', 'error')
  ),
  loaded: state(),
  error: state(
    transition('retry', 'loading')
  )
});
```

### Transition Syntax

Each transition takes:
- An event name (what triggers the transition)
- A target state (where to go when triggered)
- Optional guards and actions

Transitions are deterministic - for any given state and event combination, there's only one possible outcome.

## EVENTS

<span id="events"></span>

Events are the triggers that cause state transitions. They represent things that happen in your application - user interactions, API responses, timers, etc.

```js
import { interpret } from 'robot3';

const service = interpret(machine, () => {
  console.log('State changed to:', service.machine.current);
});

// Send events to trigger transitions
service.send('fetch');
service.send('done');
```

### Event Data

Events can carry data that's used by guards and actions:

```js
service.send({ type: 'done', data: { user: 'Alice' } });
```

### Event Types

Robot supports several types of events:
- **User events**: Explicitly sent via `service.send()`
- **Immediate transitions**: Automatically triggered when entering a state
- **Invoked promises**: Success/error events from async operations

## GUARDS

<span id="guards"></span>

Guards are conditions that must be met for a transition to occur. They let you add conditional logic to your state machines without complicating the state structure.

```js
import { createMachine, state, transition, guard } from 'robot3';

const machine = createMachine({
  idle: state(
    transition('submit', 'processing',
      guard((ctx) => ctx.form.isValid)
    )
  ),
  processing: state()
});
```

### Guard Functions

Guards are pure functions that receive the context and event, returning `true` to allow the transition or `false` to prevent it:

```js
const isValidUser = (ctx, event) => {
  return event.user && event.user.age >= 18;
};

const machine = createMachine({
  waiting: state(
    transition('login', 'authenticated',
      guard(isValidUser)
    )
  ),
  authenticated: state()
});
```

### Multiple Guards

You can chain multiple guards - all must pass for the transition to occur:

```js
transition('submit', 'processing',
  guard(isValid),
  guard(hasPermission)
)
```

## ACTIONS

<span id="actions"></span>

Actions are side effects that occur during transitions. They let you update context, make API calls, update the DOM, or perform any other effects.

```js
import { createMachine, state, transition, action } from 'robot3';

const updateUser = action((ctx, event) => {
  return { ...ctx, user: event.user };
});

const machine = createMachine({
  idle: state(
    transition('login', 'authenticated', updateUser)
  ),
  authenticated: state()
});
```

### Action Types

Robot supports different types of actions:

#### Context Actions
Update the machine's context:

```js
const increment = action((ctx) => ({ ...ctx, count: ctx.count + 1 }));
```

#### Side Effect Actions
Perform effects without changing context:

```js
const log = action((ctx, event) => {
  console.log('Transitioning with:', event);
  return ctx; // Return unchanged context
});
```

#### Multiple Actions

Chain multiple actions to execute in sequence:

```js
transition('submit', 'success',
  validate,
  saveToAPI,
  updateUI
)
```

### Action Timing

Actions execute during the transition, after guards have passed but before entering the new state. This timing ensures:
- Guards see the old context
- The new state receives the updated context
- Side effects don't occur if guards fail

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

These core concepts form the foundation of Robot's state management. Master these, and you'll be able to model complex application behavior in a clear, maintainable way.