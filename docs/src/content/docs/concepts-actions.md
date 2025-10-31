---
title: Understanding Actions
tags: concept
---

# Understanding Actions

Actions are side effects that occur during transitions. They let you update context, make API calls, update the DOM, log events, or perform any other effects when moving between states.

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
  return ctx;  // Return unchanged context
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

They must return the context (modified or unchanged):

```js
const updateUser = action((ctx, event) => {
  return {
    ...ctx,
    user: event.user,
    lastUpdated: Date.now()
  };
});

const machine = createMachine({
  idle: state(
    transition('login', 'authenticated', updateUser)
  ),
  authenticated: state()
});
```

## Types of Actions

### Context Updates

The most common use of actions is updating the machine's context:

```js
const increment = action((ctx) => ({
  ...ctx,
  count: ctx.count + 1
}));

const setUser = action((ctx, event) => ({
  ...ctx,
  user: event.data
}));

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

### Side Effects

Actions can perform side effects without modifying context:

```js
const logEvent = action((ctx, event) => {
  console.log('Event occurred:', event.type);
  return ctx;  // Context unchanged
});

const showNotification = action((ctx, event) => {
  alert(`Status: ${event.message}`);
  return ctx;
});

const trackAnalytics = action((ctx, event) => {
  analytics.track('state_changed', {
    from: ctx.previousState,
    to: event.type
  });
  return ctx;
});
```

### DOM Manipulation

Actions can update the UI directly:

```js
const showSpinner = action((ctx) => {
  document.querySelector('#spinner').style.display = 'block';
  return ctx;
});

const hideSpinner = action((ctx) => {
  document.querySelector('#spinner').style.display = 'none';
  return ctx;
});

const updateUI = action((ctx) => {
  document.querySelector('#status').textContent = ctx.status;
  return ctx;
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
  return ctx;
});
```

## The `reduce` Helper

Robot provides a `reduce` helper as a shorthand for context-updating actions:

```js
import { reduce } from 'robot3';

// Using action
const increment = action((ctx) => ({ ...ctx, count: ctx.count + 1 }));

// Using reduce (same thing, less verbose)
const increment = reduce((ctx) => ({ ...ctx, count: ctx.count + 1 }));

// Common usage
idle: state(
  transition('increment', 'idle',
    reduce((ctx) => ({ ...ctx, count: ctx.count + 1 }))
  )
)
```

## Multiple Actions

You can chain multiple actions - they execute in sequence:

```js
const validate = reduce((ctx, ev) => ({
  ...ctx,
  isValid: ev.data.length > 0
}));

const trackSubmit = action((ctx) => {
  analytics.track('form_submitted');
  return ctx;
});

const clearForm = reduce((ctx) => ({
  ...ctx,
  data: ''
}));

const machine = createMachine({
  editing: state(
    transition('submit', 'submitted',
      validate,      // 1. Validate data
      trackSubmit,   // 2. Track event
      clearForm      // 3. Clear form
    )
  ),
  submitted: state()
});
```

Actions execute in order, and each action receives the context returned by the previous action.

## Action Execution Order

When a transition occurs, this is the execution order:

1. **Event received**: Machine receives an event
2. **Transition found**: Matching transition in current state
3. **Guards checked**: All guards must pass (see [Guards](/docs/concepts-guards/))
4. **Actions execute**: Actions run in sequence
5. **Context updated**: New context from actions takes effect
6. **State changes**: Machine transitions to target state
7. **Listeners notified**: Change listeners called with new state and context

```js
const machine = createMachine({
  idle: state(
    transition('submit', 'processing',
      guard((ctx) => ctx.isValid),        // 1. Guard checks
      action((ctx) => {                    // 2. First action
        console.log('First:', ctx.count);  // Shows 0
        return { ...ctx, count: 1 };
      }),
      action((ctx) => {                    // 3. Second action
        console.log('Second:', ctx.count); // Shows 1
        return { ...ctx, count: 2 };
      })
    )
  ),
  processing: state()                      // 4. New state with count: 2
}, () => ({ count: 0, isValid: true }));
```

## Actions vs Invoke

Choose between actions and invoke based on your needs:

### Use Actions When:
- Making synchronous updates
- Performing immediate side effects
- Updating context based on event data
- No need to wait for completion

```js
// ✅ Good use of actions
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

## Action Patterns

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
  return ctx;
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
  return ctx;
});

// Save context after important transitions
transition('save', 'saved', saveToLocalStorage)
```

## Best Practices

### Keep Actions Pure When Possible

Prefer pure context updates over side effects:

```js
// ✅ Good - pure context update
const setUser = reduce((ctx, ev) => ({
  ...ctx,
  user: ev.user
}));

// ⚠️ OK but not ideal - side effect
const setUserAndNotify = action((ctx, ev) => {
  showNotification('User updated');  // Side effect
  return { ...ctx, user: ev.user };
});
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
  return { ...ctx, processed: true };
});

// ✅ Better - separate concerns
const logEvent = action((ctx, ev) => { /* ... */ });
const persistData = action((ctx) => { /* ... */ });
const trackEvent = action((ctx) => { /* ... */ });
const updateTitle = action((ctx) => { /* ... */ });
const markProcessed = reduce((ctx) => ({ ...ctx, processed: true }));

transition('submit', 'processing',
  logEvent,
  persistData,
  trackEvent,
  updateTitle,
  markProcessed
)
```

### Avoid Async Operations in Actions

Don't return promises from actions. Use `invoke` instead:

```js
// ❌ Bad - async action
const fetchUserBad = action(async (ctx) => {
  const user = await fetch('/api/user').then(r => r.json());
  return { ...ctx, user };
});

// ✅ Good - use invoke
loading: invoke(fetchUser,
  transition('done', 'loaded')
)
```

### Return Context

Always return context from actions, even if unchanged:

```js
// ❌ Bad - forgot to return context
const logBad = action((ctx) => {
  console.log(ctx);
  // Missing return!
});

// ✅ Good - always return context
const logGood = action((ctx) => {
  console.log(ctx);
  return ctx;
});
```

## Testing Actions

Actions are easy to test since they're just functions:

```js
const increment = reduce((ctx) => ({
  ...ctx,
  count: ctx.count + 1
}));

// Test without a machine
const ctx = { count: 5 };
const result = increment(ctx, {});
console.assert(result.count === 6);
```

## Common Pitfalls

### Mutating Context

Never mutate context directly:

```js
// ❌ Bad - mutating context
const badAction = action((ctx) => {
  ctx.count++;  // Mutation!
  return ctx;
});

// ✅ Good - returning new context
const goodAction = reduce((ctx) => ({
  ...ctx,
  count: ctx.count + 1
}));
```

### Side Effects Without Returning Context

Don't forget to return context after side effects:

```js
// ❌ Bad
const badSideEffect = action((ctx) => {
  console.log('Event!');
  // Forgot to return ctx!
});

// ✅ Good
const goodSideEffect = action((ctx) => {
  console.log('Event!');
  return ctx;  // Always return
});
```

### Complex Business Logic

Keep complex logic out of actions when possible:

```js
// ❌ Bad - complex logic in action
const complexAction = action((ctx, ev) => {
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

const simpleAction = reduce((ctx, ev) => ({
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
