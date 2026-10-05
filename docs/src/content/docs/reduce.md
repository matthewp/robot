---
title: reduce
tags: api
permalink: api/reduce.html
section: api
---

# reduce

__reduce__ takes a reducer function for changing the [context](/docs/createMachine/#context) of the machine. A common use case is to set values coming from form fields.

The reducer receives the current context and the event, and the value it returns becomes the new context. Always return the context, even if unchanged. For side effects that don't change context, use [action](/docs/action/).

When a transition has several reducers and actions, they run in the order they are listed, and each receives the context returned by the reducers before it.

In this example are implementing a login form that sets the `login` and `password` properties on the context.

```js
import { createMachine, reduce, state, transition } from 'robot3';

const machine = createMachine({
  idle: state(
    transition('login', 'idle',
      reduce((ctx, ev) => ({ ...ctx, login: ev.target.value }))
    ),
    transition('password', 'idle',
      reduce((ctx, ev) => ({ ...ctx, password: ev.target.value }))
    ),
    transition('submit', 'complete')
  ),
  complete: state()
});
```