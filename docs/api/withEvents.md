---
layout: api.njk
title: withEvents
tags: api
permalink: api/withEvents.html
---

# withEvents

Use __withEvents__ to configure the events triggered by a promise invoked.  Specify the event names to trigger on `success` or `failure`:

```js
import { createMachine, state, invoke, withEvents } from 'robot3';

const machine = createMachine({
  start: invoke(withEvents(runTask, 'yay', 'nay'),
    transition('yay', 'complete'),
    transition('nay', 'error')
  ),
  complete: state(),
  error: state()
});
```

## Arguments

__signature__: `withEvents(promiseFn, successEvent, failureEvent)`

These are the arguments to `withEvent`:

### promiseFn

The function that will return a promise, as supplied to [invoke](./invoke.html).

### success

The name of the event triggered when the promise resolves.  Defaults to `done`.

### failure

The name of the event triggered when the promise rejects.  Defaults to `error`.
