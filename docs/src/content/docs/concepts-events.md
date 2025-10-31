---
title: Understanding Events
tags: concept
---

# Understanding Events

Events are the triggers that cause state transitions. They represent things that happen in your application - user interactions, API responses, timers, system notifications, or any other occurrence that should cause your machine to change state.

In traditional imperative code, you handle events by directly manipulating state variables. With finite state machines, events are sent to the machine, which then determines if and how the state should change based on the current state and defined transitions.

## Sending Events

Events are sent to a machine service using the `send` method:

```js
import { interpret } from 'robot3';

const service = interpret(machine, () => {
  console.log('State changed to:', service.machine.current);
});

// Send events to trigger transitions
service.send('fetch');
service.send('success');
service.send('retry');
```

## Event Types

Robot supports several types of events that work together to create responsive state machines.

### User Events

User events are explicitly sent via `service.send()`. These represent direct interactions or manual triggers:

```js
const machine = createMachine({
  idle: state(
    transition('start', 'running')
  ),
  running: state(
    transition('pause', 'paused'),
    transition('stop', 'idle')
  ),
  paused: state(
    transition('resume', 'running'),
    transition('stop', 'idle')
  )
});

const service = interpret(machine);

// User clicks a button
button.addEventListener('click', () => {
  service.send('start');  // Manually triggered user event
});
```

### Immediate Transitions

Immediate transitions automatically trigger when entering a state, without requiring an explicit event:

```js
import { createMachine, state, transition, immediate } from 'robot3';

const machine = createMachine({
  idle: state(
    transition('fetch', 'loading')
  ),
  loading: state(
    transition('done', 'validate')
  ),
  validate: state(
    // Automatically transitions when entering 'validate'
    immediate('loaded', guard(isValid)),
    immediate('error', guard(isInvalid))
  ),
  loaded: state(),
  error: state()
});
```

### Invoked Events

When using `invoke` for async operations, Robot automatically generates `done` and `error` events:

```js
import { createMachine, invoke, state, transition } from 'robot3';

async function fetchUsers() {
  const response = await fetch('/api/users');
  return response.json();
}

const machine = createMachine({
  idle: state(
    transition('fetch', 'loading')
  ),
  loading: invoke(fetchUsers,
    // 'done' event fires automatically on success
    transition('done', 'loaded'),
    // 'error' event fires automatically on failure
    transition('error', 'error')
  ),
  loaded: state(),
  error: state()
});
```

## Event Payloads

Events can carry additional data that's used by guards, actions, or reducers:

```js
// Simple string event
service.send('increment');

// Event object with data
service.send({
  type: 'login',
  username: 'alice',
  timestamp: Date.now()
});

// Event with complex data
service.send({
  type: 'updateUser',
  data: {
    id: 123,
    name: 'Alice',
    email: 'alice@example.com'
  }
});
```

### Accessing Event Data

Event data is available in guards, actions, and reducers:

```js
import { createMachine, state, transition, guard, reduce } from 'robot3';

const machine = createMachine({
  idle: state(
    transition('login', 'authenticating',
      // Guard can check event data
      guard((ctx, ev) => ev.username && ev.password),
      // Reducer can use event data
      reduce((ctx, ev) => ({
        ...ctx,
        username: ev.username
      }))
    )
  ),
  authenticating: state()
});

// Send event with data
service.send({
  type: 'login',
  username: 'alice',
  password: 'secret123'
});
```

## Event Naming Conventions

Choose event names that describe what happened, using past tense or present tense:

```js
// ✅ Good - describes what happened
'clicked'
'submitted'
'success'
'error'
'timeout'
'userLoggedIn'

// ❌ Avoid - describes what to do
'goToNextPage'
'shouldLoad'
'handleClick'
'makeRequest'
```

This keeps your state machine declarative and easier to reason about.

## Event Flow

Here's how events flow through a state machine:

1. **Event sent**: `service.send('eventName')` is called
2. **Current state checked**: Machine looks at transitions in the current state
3. **Matching transition found**: Machine finds a transition with that event name
4. **Guards evaluated**: If guards exist, they check if transition can proceed
5. **Actions executed**: If guards pass, actions/reducers run
6. **State changes**: Machine transitions to target state
7. **Listeners notified**: Any change listeners are called

```js
const machine = createMachine({
  idle: state(
    transition('fetch', 'loading',
      guard((ctx) => ctx.hasToken),
      reduce((ctx) => ({ ...ctx, loading: true }))
    )
  ),
  loading: state()
});

// This triggers the entire flow above
service.send('fetch');
```

## Event Queuing

Events are processed synchronously in the order they're sent. If you send multiple events, they're handled one at a time:

```js
service.send('first');   // Processed immediately
service.send('second');  // Processed after 'first' completes
service.send('third');   // Processed after 'second' completes
```

This predictable ordering prevents race conditions and makes debugging easier.

## Ignored Events

If an event is sent but there's no matching transition in the current state, the event is ignored:

```js
const machine = createMachine({
  idle: state(
    transition('start', 'running')
    // No 'stop' transition defined
  ),
  running: state(
    transition('stop', 'idle')
  )
});

const service = interpret(machine);

// Machine is in 'idle' state
service.send('stop');  // Ignored - no 'stop' transition from 'idle'
service.send('start'); // Works - transitions to 'running'
```

This is intentional and prevents invalid state transitions. Only events defined in the current state's transitions can cause state changes.

## Event-Driven Architecture

Events make your state machines reactive and decoupled:

```js
// Different parts of your app can send events
button.addEventListener('click', () => {
  service.send('userAction');
});

socket.on('message', (data) => {
  service.send({ type: 'messageReceived', data });
});

setTimeout(() => {
  service.send('timeout');
}, 5000);

// The machine handles all events based on current state
const machine = createMachine({
  waiting: state(
    transition('userAction', 'processing'),
    transition('messageReceived', 'processing'),
    transition('timeout', 'expired')
  ),
  processing: state(),
  expired: state()
});
```

## Common Event Patterns

### Request/Response Pattern

```js
idle: state(
  transition('fetch', 'loading')
),
loading: state(
  transition('success', 'loaded'),
  transition('failure', 'error')
)

// Usage:
service.send('fetch');
// Later, after API call:
service.send({ type: 'success', data: result });
// Or:
service.send({ type: 'failure', error: err });
```

### User Interaction Pattern

```js
closed: state(
  transition('open', 'opening')
),
opening: state(
  transition('opened', 'open')
),
open: state(
  transition('close', 'closing')
),
closing: state(
  transition('closed', 'closed')
)
```

### Validation Pattern

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

## Why Event-Based State Changes Matter

### Predictable State Changes

Events make all state changes explicit and traceable:

```js
// Without FSM - state changes are implicit ❌
function onClick() {
  isLoading = true;
  fetchData().then(() => {
    isLoading = false;
    hasData = true;
  });
}

// With FSM - state changes are explicit ✅
function onClick() {
  service.send('fetch');
}

// Machine handles the state changes
loading: invoke(fetchData,
  transition('done', 'loaded')
)
```

### Centralized State Logic

All state change logic lives in one place - your machine definition:

```js
const machine = createMachine({
  idle: state(
    transition('start', 'running')
  ),
  running: state(
    transition('pause', 'paused'),
    transition('stop', 'idle')
  ),
  paused: state(
    transition('resume', 'running'),
    transition('stop', 'idle')
  )
});

// Any part of your code can send events
service.send('start');
service.send('pause');
service.send('resume');
```

### Decoupled Components

Components don't need to know about state logic - they just send events:

```js
// Component only sends events
function PlayButton() {
  return <button onClick={() => service.send('start')}>Play</button>;
}

function PauseButton() {
  return <button onClick={() => service.send('pause')}>Pause</button>;
}

// Machine determines what happens
const machine = createMachine({
  stopped: state(transition('start', 'playing')),
  playing: state(transition('pause', 'paused')),
  paused: state(transition('start', 'playing'))
});
```

## Related Topics

- [Transitions](/docs/concepts-transitions/) - How events trigger state changes
- [Guards](/docs/concepts-guards/) - Conditional event handling
- [Actions](/docs/concepts-actions/) - Side effects when events occur
- [invoke API](/docs/invoke/) - Automatic event generation from async operations
- [immediate API](/docs/immediate/) - Automatic transitions without explicit events
