---
title: Understanding Actions
tags: concept
---

# Understanding Actions

Actions are side effects that occur during transitions. They let you make API calls, update the DOM, log events, or perform any other effects when moving between states.

Robot has two helpers that run during a transition:

- **`action`** runs a function for its side effects. Its return value is ignored.
- **`reduce`** runs a function that returns the new context. It is how you update context.

In finite state machines, state transitions should be pure and declarative. Actions provide a controlled way to handle the inevitable side effects your application needs while keeping your state machine logic clean and predictable.

## Why Actions Matter

State machines are about defining valid states and transitions. But real applications need to do more than just change state - they need to update data, call APIs, notify users, and interact with the outside world. Actions provide a structured way to handle these side effects.

```js
// Without actions - side effects mixed with state logic
if (currentState === 'idle') {
  currentState = 'loading';
  showSpinner();
  trackEvent('loading_started');
  fetchData().then(data => {
    currentState = 'loaded';
    hideSpinner();
  });
}

// With actions - clean separation
idle: state(
  transition('fetch', 'loading',
    action(showSpinner),
    action(trackEvent)
  )
)
```

## Defining Actions

Actions are defined using the `action` function and can be added to transitions:

```js
import { createMachine, state, transition, action } from 'robot3';

const logTransition = action((ctx, event) => {
  console.log('Transitioning with:', event);
});

const machine = createMachine({
  idle: state(
    transition('start', 'running', logTransition)
  ),
  running: state()
});
```

## Action Functions

Action functions receive two arguments:
- **Context**: The current machine context
- **Event**: The event that triggered the transition

The return value of an action function is ignored. The context passes through to the next step unchanged, so there is no need to return anything:

```js
const logEvent = action((ctx, event) => {
  console.log('Event occurred:', event.type);
});

// This does NOT update context - the returned object is discarded
const setUserWrong = action((ctx, event) => ({ ...ctx, user: event.user }));
```

To update context, use [`reduce`](#updating-context-with-reduce).

## Types of Actions

### Side Effects

```js
const showNotification = action((ctx, event) => {
  alert(`Status: ${event.message}`);
});

const trackAnalytics = action((ctx, event) => {
  analytics.track('state_changed', {
    from: ctx.previousState,
    to: event.type
  });
});
```

### DOM Manipulation

Actions can update the UI directly:

```js
const showSpinner = action(() => {
  document.querySelector('#spinner').style.display = 'block';
});

const hideSpinner = action(() => {
  document.querySelector('#spinner').style.display = 'none';
});

const updateUI = action((ctx) => {
  document.querySelector('#status').textContent = ctx.status;
});
```

### API Calls

Actions can trigger API calls (though consider using `invoke` for async operations):

```js
const saveToAPI = action((ctx) => {
  fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify(ctx.data)
  });
});
```

## Updating Context with `reduce`

`reduce` is how you change a machine's context. The reducer function receives the context and event, and whatever it returns becomes the new context:

```js
import { createMachine, state, transition, reduce } from 'robot3';

const increment = reduce((ctx) => ({ ...ctx, count: ctx.count + 1 }));

const setUser = reduce((ctx, event) => ({ ...ctx, user: event.user }));

const machine = createMachine({
  idle: state(
    transition('increment', 'idle', increment),
    transition('login', 'authenticated', setUser)
  ),
  authenticated: state()
}, () => ({
  count: 0,
  user: null
}));
```

A reducer must always return the context. If it returns nothing, the context becomes `undefined`.

Use `reduce` for context updates and `action` for side effects.

## Multiple Actions and Reducers

You can combine any number of actions and reducers in a transition. They run in the order they are listed, and each one receives the context produced by the reducers before it:

```js
const validate = reduce((ctx, ev) => ({
  ...ctx,
  isValid: ev.data.length > 0
}));

const trackSubmit = action((ctx) => {
  analytics.track('form_submitted', { isValid: ctx.isValid });
});

const clearForm = reduce((ctx) => ({
  ...ctx,
  data: ''
}));

const machine = createMachine({
  editing: state(
    transition('submit', 'submitted',
      validate,      // 1. Validate data
      trackSubmit,   // 2. Track event (sees isValid from step 1)
      clearForm      // 3. Clear form
    )
  ),
  submitted: state()
});
```

## Running Code When Entering a State

Reducers and actions can also be passed directly to `state`. They run whenever the machine enters that state, no matter which transition led there:

```js
const machine = createMachine({
  idle: state(
    transition('fetch', 'loading')
  ),
  loading: state(
    reduce(ctx => ({ ...ctx, error: null, startedAt: Date.now() })),
    action(showSpinner),
    transition('done', 'loaded'),
    transition('fail', 'error')
  ),
  loaded: state(action(hideSpinner)),
  error: state(action(hideSpinner))
});
```

This keeps the context a state depends on next to the state, instead of spread across every transition that leads into it. Entry reducers and actions run after the transition's own reducers, and don't run on a transition from a state to itself. See [state](/docs/state/#entering-a-state) for the details.

## Execution Order

When a transition occurs, this is the execution order:

1. **Event received**: Machine receives an event
2. **Transition found**: Matching transition in current state
3. **Guards checked**: All guards must pass (see [Guards](/docs/concepts-guards/))
4. **Actions and reducers run**: In the order they are listed
5. **Context updated**: The context returned by the last reducer takes effect
6. **State changes**: Machine transitions to target state
7. **Entry actions and reducers run**: Those passed to the target `state`, unless it's a transition from a state to itself
8. **Listeners notified**: Change listeners called with new state and context

```js
const machine = createMachine({
  idle: state(
    transition('submit', 'processing',
      guard((ctx) => ctx.isValid),        // 1. Guard checks
      action((ctx) => {                    // 2. Action sees count: 0
        console.log('First:', ctx.count);
      }),
      reduce((ctx) => ({ ...ctx, count: 1 })),  // 3. Reducer sets count: 1
      action((ctx) => {                    // 4. Action sees count: 1
        console.log('Second:', ctx.count);
      })
    )
  ),
  processing: state()                      // 5. New state with count: 1
}, () => ({ count: 0, isValid: true }));
```

## Actions vs Invoke

Choose between actions and invoke based on your needs:

### Use Actions and Reducers When:
- Making synchronous updates
- Performing immediate side effects
- Updating context based on event data
- No need to wait for completion

```js
// ✅ Good use of reduce
idle: state(
  transition('update', 'idle',
    reduce((ctx, ev) => ({ ...ctx, value: ev.value }))
  )
)
```

### Use Invoke When:
- Handling async operations
- Waiting for promises to resolve
- Need to transition based on success/failure
- Want automatic error handling

```js
// ✅ Good use of invoke
idle: state(
  transition('fetch', 'loading')
),
loading: invoke(fetchData,
  transition('done', 'loaded'),
  transition('error', 'error')
)
```

## Patterns

### Validation and Enrichment

```js
const validateAndEnrich = reduce((ctx, ev) => {
  const cleaned = ev.data.trim();
  const isValid = cleaned.length > 0;
  return {
    ...ctx,
    data: cleaned,
    isValid,
    validatedAt: Date.now()
  };
});

idle: state(
  transition('submit', 'validating', validateAndEnrich)
)
```

### Logging and Analytics

```js
const trackTransition = action((ctx, ev) => {
  console.log(`[${new Date().toISOString()}] ${ev.type}`);
  analytics.track('transition', {
    event: ev.type,
    state: ctx.currentState
  });
});

// Add to every important transition
transition('submit', 'processing', trackTransition)
```

### Error Handling

```js
const captureError = reduce((ctx, ev) => ({
  ...ctx,
  error: ev.error,
  errorTime: Date.now(),
  errorMessage: ev.error.message
}));

const clearError = reduce((ctx) => ({
  ...ctx,
  error: null,
  errorMessage: null
}));

error: state(
  transition('retry', 'loading', clearError)
)
```

### State Persistence

```js
const saveToLocalStorage = action((ctx) => {
  localStorage.setItem('appState', JSON.stringify(ctx));
});

// Save context after important transitions
transition('save', 'saved', saveToLocalStorage)
```

## Best Practices

### Separate Context Updates from Side Effects

Use `reduce` to change context and `action` for everything else:

```js
// ❌ Bad - action's return value is ignored, so user is never set
const setUserAndNotify = action((ctx, ev) => {
  showNotification('User updated');
  return { ...ctx, user: ev.user };
});

// ✅ Good - one reducer, one action
const setUser = reduce((ctx, ev) => ({ ...ctx, user: ev.user }));
const notifyUserUpdated = action(() => showNotification('User updated'));

transition('update', 'idle', setUser, notifyUserUpdated)
```

### One Responsibility Per Action

Keep actions focused on a single task:

```js
// ❌ Bad - doing too much
const megaAction = action((ctx, ev) => {
  console.log('Event:', ev);
  localStorage.setItem('data', ctx.data);
  analytics.track('event');
  document.title = ctx.page;
});

// ✅ Better - separate concerns
const logEvent = action((ctx, ev) => { /* ... */ });
const persistData = action((ctx) => { /* ... */ });
const trackEvent = action((ctx) => { /* ... */ });
const updateTitle = action((ctx) => { /* ... */ });

transition('submit', 'processing',
  logEvent,
  persistData,
  trackEvent,
  updateTitle
)
```

### Avoid Async Operations in Actions

Robot doesn't wait for promises returned from actions or reducers. Use `invoke` for async work:

```js
// ❌ Bad - the promise is ignored and user is never set
const fetchUserBad = action(async (ctx) => {
  const user = await fetch('/api/user').then(r => r.json());
  return { ...ctx, user };
});

// ✅ Good - use invoke
loading: invoke(fetchUser,
  transition('done', 'loaded',
    reduce((ctx, ev) => ({ ...ctx, user: ev.data }))
  )
)
```

## Testing Reducers and Actions

Define the functions separately so you can test them without a machine:

```js
function incrementCount(ctx) {
  return { ...ctx, count: ctx.count + 1 };
}

// Test without a machine
const result = incrementCount({ count: 5 });
console.assert(result.count === 6);

// Use in a machine
transition('increment', 'idle', reduce(incrementCount))
```

## Common Pitfalls

### Returning Context from an Action

An action's return value is discarded, so returning a new context from it does nothing:

```js
// ❌ Bad - context is not updated
const setDone = action((ctx) => ({ ...ctx, done: true }));

// ✅ Good
const setDone = reduce((ctx) => ({ ...ctx, done: true }));
```

### Forgetting to Return from a Reducer

A reducer's return value replaces the context, so always return it:

```js
// ❌ Bad - context becomes undefined
const logBad = reduce((ctx) => {
  console.log(ctx);
});

// ✅ Good - use an action for side effects
const logGood = action((ctx) => {
  console.log(ctx);
});
```

### Mutating Context

An action receives the context object itself, so mutating it does change the context:

```js
const addItem = action((ctx, ev) => {
  ctx.items.push(ev.item);
});
```

This works, but prefer returning a new object from `reduce`. Explicit context updates are easier to follow and test, and code that compares context objects by reference (like UI framework change detection) won't notice an in-place mutation.

```js
const addItem = reduce((ctx, ev) => ({
  ...ctx,
  items: [...ctx.items, ev.item]
}));
```

### Complex Business Logic

Keep complex logic out of reducers when possible:

```js
// ❌ Bad - complex logic in the reducer
const complexReducer = reduce((ctx, ev) => {
  let newValue = ctx.value;
  if (ev.type === 'increment') {
    newValue += ev.amount || 1;
  } else if (ev.type === 'decrement') {
    newValue -= ev.amount || 1;
  }
  // ... more logic
  return { ...ctx, value: newValue };
});

// ✅ Better - separate functions
function calculateNewValue(ctx, ev) {
  if (ev.type === 'increment') return ctx.value + (ev.amount || 1);
  if (ev.type === 'decrement') return ctx.value - (ev.amount || 1);
  return ctx.value;
}

const simpleReducer = reduce((ctx, ev) => ({
  ...ctx,
  value: calculateNewValue(ctx, ev)
}));
```

## Related Topics

- [Transitions](/docs/concepts-transitions/) - Where actions execute
- [Guards](/docs/concepts-guards/) - Conditions checked before actions
- [Events](/docs/concepts-events/) - What triggers actions
- [action API](/docs/action/) - Technical reference for the action function
- [reduce API](/docs/reduce/) - Technical reference for the reduce helper
- [invoke API](/docs/invoke/) - For async operations instead of actions
