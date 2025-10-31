---
title: Understanding Transitions
tags: concept
---

# Understanding Transitions

Transitions define how your machine moves from one state to another in response to events. They're the arrows in your state diagram, the pathways that connect your states together.

In traditional imperative programming, state changes happen anywhere in your code. With finite state machines, all possible state changes are explicitly declared as transitions, making your application's behavior predictable and preventing unexpected state changes.

## Defining Transitions

Transitions are defined within states using the `transition` function:

```js
import { createMachine, state, transition } from 'robot3';

const machine = createMachine({
  idle: state(
    transition('fetch', 'loading')
  ),
  loading: state(
    transition('success', 'loaded'),
    transition('error', 'error')
  ),
  loaded: state(),
  error: state(
    transition('retry', 'loading')
  )
});
```

## Transition Anatomy

Each transition has three parts:

1. **Event name**: What triggers the transition
2. **Target state**: Where to go when triggered
3. **Optional modifiers**: Guards, actions, or reducers (covered in other guides)

```js
transition('eventName', 'targetState')
```

### Event Names

Event names are strings that identify what action or occurrence triggers the transition:

```js
idle: state(
  transition('start', 'running'),
  transition('cancel', 'cancelled')
)
```

Choose event names that describe what happened, not what should happen:
- ✅ Good: `'success'`, `'error'`, `'click'`, `'timeout'`
- ❌ Avoid: `'goToLoaded'`, `'shouldError'`, `'handleClick'`

### Target States

The target state must be a valid state name defined in your machine:

```js
const machine = createMachine({
  red: state(
    transition('next', 'yellow')  // 'yellow' must exist
  ),
  yellow: state(
    transition('next', 'green')
  ),
  green: state(
    transition('next', 'red')
  )
});
```

## Deterministic Transitions

For any given state and event combination, there's only one possible outcome. This determinism is key to making state machines predictable:

```js
loading: state(
  // From 'loading', the 'done' event ALWAYS goes to 'loaded'
  transition('done', 'loaded')
)
```

You cannot have multiple transitions with the same event name in a single state (without guards):

```js
// ❌ Ambiguous - which transition happens?
loading: state(
  transition('done', 'loaded'),
  transition('done', 'error')  // Can't have duplicate events
)

// ✅ Use guards for conditional transitions
loading: state(
  transition('done', 'loaded',
    guard(hasData)
  ),
  transition('done', 'error',
    guard(hasError)
  )
)
```

## Multiple Transitions

A state can have multiple transitions for different events:

```js
editing: state(
  transition('save', 'saving'),
  transition('cancel', 'view'),
  transition('delete', 'deleting'),
  transition('preview', 'previewing')
)
```

This explicitly defines all the ways you can leave a state.

## Self-Transitions

A transition can target its own state, useful for updating context without changing state:

```js
input: state(
  transition('change', 'input',
    reduce((ctx, ev) => ({ ...ctx, value: ev.target.value }))
  ),
  transition('submit', 'submitted')
)
```

## Why Explicit Transitions Matter

### Preventing Invalid State Changes

Without explicit transitions, any code can change state at any time:

```js
// Without FSM - state can change anywhere ❌
let currentState = 'idle';

function someFunction() {
  currentState = 'loaded';  // Can this happen from 'idle'? 🤔
}

function anotherFunction() {
  currentState = 'error';   // Should this be possible? 🤔
}
```

With explicit transitions, only defined paths are possible:

```js
// With FSM - only valid transitions allowed ✅
const machine = createMachine({
  idle: state(
    transition('fetch', 'loading')
    // Can't go directly to 'loaded' or 'error' from 'idle'
  ),
  loading: state(
    transition('success', 'loaded'),
    transition('error', 'error')
  )
});
```

### Self-Documenting State Flow

Your transitions create a complete map of your application's state flow:

```js
const authMachine = createMachine({
  loggedOut: state(
    transition('login', 'authenticating')
  ),
  authenticating: state(
    transition('success', 'loggedIn'),
    transition('failure', 'loggedOut'),
    transition('timeout', 'loggedOut')
  ),
  loggedIn: state(
    transition('logout', 'loggingOut')
  ),
  loggingOut: state(
    transition('done', 'loggedOut')
  )
});
```

Just by reading the machine definition, you can see every possible state change and what triggers it.

## Transition Execution Order

When an event is sent, transitions execute in this order:

1. **Event received**: The machine receives an event
2. **Transition matched**: The machine finds a transition with that event name
3. **Guards checked**: If guards exist, they must pass (covered in [Guards](/docs/concepts-guards/))
4. **Actions executed**: Any actions or reducers run (covered in [Actions](/docs/concepts-actions/))
5. **State changed**: The machine transitions to the target state
6. **Context updated**: Any context changes from actions take effect

This predictable execution order ensures consistent behavior.

## Common Patterns

### Loading Pattern

```js
idle: state(
  transition('fetch', 'loading')
),
loading: state(
  transition('success', 'loaded'),
  transition('error', 'error')
),
loaded: state(
  transition('refresh', 'loading')
),
error: state(
  transition('retry', 'loading')
)
```

### Form Validation Pattern

```js
editing: state(
  transition('submit', 'validating')
),
validating: state(
  transition('valid', 'submitting'),
  transition('invalid', 'editing')
),
submitting: state(
  transition('success', 'submitted'),
  transition('error', 'editing')
)
```

### Toggle Pattern

```js
off: state(
  transition('toggle', 'on')
),
on: state(
  transition('toggle', 'off')
)
```

## Related Topics

- [Events](/docs/concepts-events/) - What triggers transitions
- [Guards](/docs/concepts-guards/) - Conditional transitions
- [Actions](/docs/concepts-actions/) - Side effects during transitions
- [transition API](/docs/transition/) - Technical reference for the transition function
