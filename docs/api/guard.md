---
layout: api.njk
title: guard
tags: api
permalink: api/guard.html
---

# guard

A __guard__ is a method that determines if a transition can proceed. Returning `true` allows the transition to occur, returning `false` prevents it from doing so and leaves the state in its current place.

```js
import { createMachine, guard, state, transition } from 'robot3';

// Only allow submission if a login and password is entered.
function canSubmit(ctx) {
  return ctx.login && ctx.password;
}

const machine = createMachine({
  idle: state(
    transition('submit', 'complete',
      guard(canSubmit)
    )
  ),
  complete: state()
});
```