---
layout: api.njk
title: reduce
tags: api
permalink: api/reduce.html
---

# reduce

__reduce__ takes a reducer function for changing the [context](./createMachine.html#context) of the machine. A common use case is to set values coming from form fields.

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