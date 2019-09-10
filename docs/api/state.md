---
layout: api.njk
title: state
tags: api
permalink: api/state.html
---

# state

The `state` export is a function that returns a state object. A state can take [transitions](./transition.html), [immediates](./immediate.html) as arguments.

```js
import { createMachine, state, transition } from '@matthewp/robot';

const machine = createMachine({
  idle: state(
    transition('first', 'input')
  ),

  input: state(
    immediate('idle',
      reduce((ev, ctx) => ({ ...ctx, first: ev.target.value }))
    )
  )
});
```