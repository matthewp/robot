---
layout: api.njk
title: invoke
tags: api
permalink: api/invoke.html
---

# invoke

__Table of Contents__
@[toc]

A special type of [state](./state.html) that handles asynchronous operations by immediately invoking either:
- A [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)-returning function
- Another [state machine](./createMachine.html)

## Basic Usage

When the invoked operation completes, the [service](./interpret.html) sends a `done` event. The `invoke` state supports all standard [state](./state.html) arguments, but primarily uses [transitions](./transition.html) to handle completion and errors.

```js
import { createMachine, immediate, invoke, reduce, state, transition } from 'robot3';

async function loadUsers() {
  return [ { id: 1, name: 'Wilbur' } ];
}

const machine = createMachine({
  idle: state(
    transition('load', 'loading')
  ),
  loading: invoke(loadUsers,
    // Handle successful completion
    transition('done', 'idle',
      reduce((ctx, ev) => ({ ...ctx, users: ev.data }))
    ),
    // Handle errors
    transition('error', 'error',
      reduce((ctx, ev) => ({ ...ctx, error: ev.error }))
    )
  ),
  error: state()
})
```

## Working with Promises

Important: You must provide a *function* that returns a Promise, not the Promise itself. For existing promises, wrap them in a function:

```js
import { createMachine, invoke, state, transition } from 'robot3';
import loadStuff from './important-stuff.js';

// ❌ Don't do this:
// invoke(loadStuff.then(...))

// ✅ Do this instead:
const machine = createMachine({
  loading: invoke(
    () => loadStuff(),
    transition('done', 'next')
  ),
  next: state()
})
```

## Child Machines

Robot supports invoking child machines for better separation of concerns. The parent machine can:
- Receive events from the child machine
- Access the child's context when it completes
- Send events to the child via the service

```js
import { createMachine, invoke, reduce, state, state as final, transition } from 'robot3';

// Child machine handling input validation
const inputMachine = createMachine({
  idle: state(
    transition('input', 'validate')
  ),
  validate: state(
    immediate('finished')
  ),
  finished: final()
});

// Parent machine orchestrating a multi-step process
const wizardMachine = createMachine({
  step1: invoke(inputMachine,
    transition('done', 'step2',
      reduce((ctx, ev) => ({ ...ctx, step1Data: ev.data }))
    )
  ),
  step2: state()
});

// Access child machine via service.child
let service = interpret(wizardMachine, innerService => {
  if(service !== innerService) {
    // Child machine service available here
    service.child.send('input');
  }
});
```

## Dynamic Machine Selection

You can dynamically choose which machine to invoke based on context or events:

```js
const machines = {
  form: createMachine({ /* form logic */ }),
  wizard: createMachine({ /* wizard logic */ })
};

const uiMachine = createMachine({
  start: invoke(
    (ctx) => machines[ctx.type], // Dynamically select machine
    transition('done', 'complete')
  ),
  complete: state()
});
```

## Events Reference

### done
Sent when the Promise/machine completes successfully. Includes resolved data:
```js
{
  type: 'done',
  data: /* resolved value */
}
```

### error
Sent when the Promise rejects or machine errors. Includes error details:
```js
{
  type: 'error',
  error: /* Error object */
}
```

## Best Practices

1. **Always Handle Errors**
```js
invoke(asyncOperation,
  transition('done', 'success'),
  transition('error', 'error') // Don't forget error handling!
)
```

2. **Clean Up Resources**
```js
invoke(longRunningOperation,
  transition('cancel', 'cancelled'), // Add cancellation
  transition('done', 'success')
)
```

3. **Use Context for State**
```js
invoke(loadData,
  transition('done', 'success',
    reduce((ctx, ev) => ({
      ...ctx,
      isLoading: false,
      data: ev.data
    }))
  )
)
```

## Cancellation

While JavaScript Promises can't be truly cancelled, you can ignore their results by transitioning away from the `invoke` state before completion:

```js
const machine = createMachine({
  loading: invoke(loadData,
    transition('cancel', 'cancelled'), // Results will be ignored after cancel
    transition('done', 'success')
  ),
  cancelled: state(),
  success: state()
});

// Later...
service.send('cancel'); // Transition away, ignore future results
```

Note: The underlying Promise will still complete, but its results won't affect the machine state.


