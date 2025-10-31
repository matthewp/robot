---
title: Understanding Guards
tags: concept
---

# Understanding Guards

Guards are conditions that must be met for a transition to occur. They let you add conditional logic to your state machines without complicating the state structure.

Think of guards as gatekeepers - they decide whether a transition can proceed based on the current context and event data. This allows your state machine to make intelligent decisions while keeping your states clean and focused.

## Why Guards Matter

Without guards, you'd need separate states for every conditional path, leading to state explosion:

```js
// ❌ Without guards - too many states
const machine = createMachine({
  idle: state(
    transition('submit', 'checkingValid')
  ),
  checkingValid: state(
    transition('isValid', 'checkingPermission')
  ),
  checkingPermission: state(
    transition('hasPermission', 'submitting'),
    transition('noPermission', 'idle')
  )
});
```

With guards, you can handle conditions inline:

```js
// ✅ With guards - clean and concise
const machine = createMachine({
  idle: state(
    transition('submit', 'submitting',
      guard(isValid),
      guard(hasPermission)
    )
  ),
  submitting: state()
});
```

## Defining Guards

Guards are functions that return `true` to allow a transition or `false` to prevent it:

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

## Guard Functions

Guard functions receive two arguments:
- **Context**: The current machine context
- **Event**: The event that triggered the transition

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
}, () => ({
  currentUser: null
}));

// Usage
service.send({
  type: 'login',
  user: { name: 'Alice', age: 25 }
});
```

## Multiple Guards

You can chain multiple guards - all must return `true` for the transition to proceed:

```js
const isValid = (ctx) => ctx.input.length > 0;
const hasPermission = (ctx) => ctx.user.role === 'admin';
const notRateLimited = (ctx) => ctx.requestCount < 10;

const machine = createMachine({
  idle: state(
    transition('submit', 'processing',
      guard(isValid),
      guard(hasPermission),
      guard(notRateLimited)
    )
  ),
  processing: state()
});
```

Guards are evaluated in order. If any guard returns `false`, the transition is blocked and subsequent guards don't run.

## Guards vs State Splits

When should you use guards vs creating separate states? Here's a guideline:

### Use Guards When:
- The condition is a validation check
- The condition is temporary or context-based
- You want to block a transition conditionally

```js
// ✅ Good use of guards
idle: state(
  transition('submit', 'processing',
    guard((ctx) => ctx.email && ctx.password)  // Validation
  )
)
```

### Use Separate States When:
- The condition represents a distinct mode or phase
- The state has different UI requirements
- Different transitions are available in each condition

```js
// ✅ Good use of separate states
loggedOut: state(
  transition('login', 'authenticating')
),
loggedIn: state(
  transition('logout', 'loggingOut')
)
```

## Guard Patterns

### Validation Guards

Check if data meets requirements before proceeding:

```js
const hasEmail = (ctx, ev) => ev.email && ev.email.includes('@');
const hasPassword = (ctx, ev) => ev.password && ev.password.length >= 8;
const termsAccepted = (ctx, ev) => ev.acceptedTerms === true;

const machine = createMachine({
  form: state(
    transition('submit', 'submitting',
      guard(hasEmail),
      guard(hasPassword),
      guard(termsAccepted)
    )
  ),
  submitting: state()
});
```

### Permission Guards

Check if user has required permissions:

```js
const isAdmin = (ctx) => ctx.user.role === 'admin';
const isOwner = (ctx, ev) => ctx.user.id === ev.resourceOwnerId;
const hasEditAccess = (ctx) => ctx.user.permissions.includes('edit');

const machine = createMachine({
  viewing: state(
    transition('edit', 'editing',
      guard(isAdmin)  // Only admins can edit
    ),
    transition('delete', 'deleting',
      guard(isOwner)  // Only owner can delete
    )
  ),
  editing: state(),
  deleting: state()
});
```

### Rate Limiting Guards

Prevent too many actions in a time period:

```js
const notRateLimited = (ctx) => {
  const now = Date.now();
  const timeSinceLastRequest = now - ctx.lastRequestTime;
  return timeSinceLastRequest > 1000; // 1 second between requests
};

const machine = createMachine({
  idle: state(
    transition('fetch', 'loading',
      guard(notRateLimited)
    )
  ),
  loading: state()
}, () => ({
  lastRequestTime: 0
}));
```

### Feature Flag Guards

Enable/disable features based on configuration:

```js
const featureEnabled = (ctx) => ctx.features.newUI === true;
const betaUser = (ctx) => ctx.user.betaTester === true;

const machine = createMachine({
  home: state(
    transition('openNewFeature', 'newFeature',
      guard(featureEnabled),
      guard(betaUser)
    )
  ),
  newFeature: state()
});
```

## Conditional Transitions

You can have multiple transitions for the same event with different guards. The first transition whose guards pass will be taken:

```js
const isValid = (ctx) => ctx.data.isValid;
const isInvalid = (ctx) => !ctx.data.isValid;

const machine = createMachine({
  validating: state(
    // First matching transition wins
    transition('done', 'success',
      guard(isValid)
    ),
    transition('done', 'error',
      guard(isInvalid)
    )
  ),
  success: state(),
  error: state()
});
```

This is how you achieve branching logic in state machines.

## Guard Execution Timing

Guards execute before any actions or reducers. This ensures:
- Guards see the old context (before actions modify it)
- Actions only run if guards pass
- State changes only happen if guards pass

```js
const machine = createMachine({
  idle: state(
    transition('submit', 'processing',
      guard((ctx) => {
        console.log('Guard checking:', ctx.value);  // Sees old value
        return ctx.value > 0;
      }),
      reduce((ctx) => {
        console.log('Reducer running:', ctx.value);  // Only runs if guard passes
        return { ...ctx, value: ctx.value + 1 };
      })
    )
  ),
  processing: state()
}, () => ({ value: 5 }));
```

## Pure Guards

Guards should be pure functions - they should:
- Not modify context or external state
- Return the same result for the same inputs
- Not have side effects

```js
// ✅ Good - pure guard
const isValid = (ctx) => ctx.count > 0;

// ❌ Bad - has side effects
const isValidWithSideEffect = (ctx) => {
  console.log('Checking validity');  // Side effect
  ctx.count++;  // Mutates context
  return true;
};

// ❌ Bad - non-deterministic
const isValidRandom = (ctx) => Math.random() > 0.5;  // Random result
```

Keep guards pure to ensure predictable behavior and easier testing.

## Testing Guards

Guards are easy to test since they're pure functions:

```js
const isEligible = (ctx, ev) => {
  return ev.age >= 18 && ctx.country === 'US';
};

// Test without a full machine
console.assert(
  isEligible({ country: 'US' }, { age: 21 }) === true
);
console.assert(
  isEligible({ country: 'US' }, { age: 16 }) === false
);
console.assert(
  isEligible({ country: 'UK' }, { age: 21 }) === false
);
```

## Common Pitfalls

### Avoid Complex Logic in Guards

Keep guards simple and focused:

```js
// ❌ Too complex
const complexGuard = (ctx, ev) => {
  if (ctx.user.role === 'admin') {
    if (ev.action === 'delete') {
      if (ctx.items.length > 0) {
        return ctx.items.every(item => item.status !== 'locked');
      }
    }
  }
  return false;
};

// ✅ Better - break into smaller guards
const isAdmin = (ctx) => ctx.user.role === 'admin';
const isDeleteAction = (ctx, ev) => ev.action === 'delete';
const hasItems = (ctx) => ctx.items.length > 0;
const noLockedItems = (ctx) => ctx.items.every(item => item.status !== 'locked');

transition('submit', 'processing',
  guard(isAdmin),
  guard(isDeleteAction),
  guard(hasItems),
  guard(noLockedItems)
)
```

### Don't Use Guards for Navigation Logic

Guards should validate conditions, not determine destinations:

```js
// ❌ Bad - using guards for routing
idle: state(
  transition('next', 'stateA', guard(conditionA)),
  transition('next', 'stateB', guard(conditionB)),
  transition('next', 'stateC', guard(conditionC))
)

// ✅ Better - use separate events or immediate transitions
idle: state(
  transition('next', 'deciding')
),
deciding: state(
  immediate('stateA', guard(conditionA)),
  immediate('stateB', guard(conditionB)),
  immediate('stateC')  // Default
)
```

## Related Topics

- [Transitions](/docs/concepts-transitions/) - How guards control transitions
- [Events](/docs/concepts-events/) - What triggers guard evaluation
- [Actions](/docs/concepts-actions/) - What happens after guards pass
- [guard API](/docs/guard/) - Technical reference for the guard function
- [immediate API](/docs/immediate/) - Using guards with immediate transitions
