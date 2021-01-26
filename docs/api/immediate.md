---
layout: api.njk
title: immediate
tags: api
permalink: api/immediate.html
---

# immediate

An __immediate__ is a type of transition that occurs immediately; it doesn't wait for an event to proceed. This is a state that immediately proceeds to the next:

```js
import { createMachine, reduce, state, transition } from 'robot3';

const machine = createMachine({
  breakfast: state(
    immediate('work')
  ),
  work: state()
});
```

Typically an immediate is used in conjunction with a [guard](./guard.html) or [reducer](./reduce.html). A common pattern is to have an intermediate state that uses immediates and guards to determine which next state should be proceeded to. I use this pattern often with *validation*:

```js
import { createMachine, reduce, state, transition } from 'robot3';

const machine = createMachine({
  idle: state(
    transition('submit', 'validate')
  ),
  validate: state(
    immediate('submission', guard(canSubmit)),
    immediate('idle')
  ),
  submission: state()
});
```

The above proceeds to the `validate` state when the `submit` event occurs. It determines if submission is valid before proceeding, if not it goes back to the `idle` state.
