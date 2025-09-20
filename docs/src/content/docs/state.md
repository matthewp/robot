---
title: state
tags: api
permalink: api/state.html
section: api
---

# state

The `state` export is a function that returns a state object. A state can take [transitions](/docs/transition/), [immediates](/docs/immediate/) as arguments.

```js
import { createMachine, state, transition } from 'robot3';

const machine = createMachine({
  idle: state(
    transition('first', 'input')
  ),

  input: state(
    immediate('idle',
      reduce((ctx, ev) => ({ ...ctx, first: ev.target.value }))
    )
  )
});
```

## Final state

A state with no [transitions](/docs/transition/) or [immediates](/docs/immediate/). In other libraries you have to make a state as final with `{ type: 'final' }` or some other sort of configuration. We don't have a configuration because it is not necessary; by definition a machine with no transitions *cannot* go to another state anyways.

You might find it convenient to have a `final` function anyways. You can achieve this by aliasing `state` to final like so:

```js
import { createMachine, state, state as final } from 'robot3';

const machine = createMachine({
  pending: state(
    transition('done', 'finished')
  ),
  finished: final()
});
```

This improves readability so it is a recommended pattern.