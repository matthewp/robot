---
title: state
tags: api
permalink: api/state.html
section: api
---

# state

The `state` export is a function that returns a state object. A state can take [transitions](/docs/transition/), [immediates](/docs/immediate/), [reducers](/docs/reduce/) and [actions](/docs/action/) as arguments.

```js
import { createMachine, state, transition, immediate, reduce } from 'robot3';

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

## Entering a state

Reducers and actions passed directly to `state` run every time the machine enters that state. Use them to set up the context a state needs, next to the state that needs it:

```js
import { createMachine, state, transition, reduce, action } from 'robot3';

const machine = createMachine({
  welcome: state(
    reduce(ctx => ({ ...ctx, buttonLabel: 'Get started' })),
    transition('next', 'profile')
  ),
  profile: state(
    reduce(ctx => ({ ...ctx, buttonLabel: 'Save profile' })),
    action(() => analytics.track('profile_viewed')),
    transition('next', 'done')
  ),
  done: state()
});
```

Entry reducers and actions:

- Run when the machine starts in the state, and every time it enters the state through a transition or [immediate](/docs/immediate/).
- Run after the reducers on the transition that led into the state, and receive the same event.
- Run before the state's [immediates](/docs/immediate/) are checked, so immediate guards see the updated context.
- Run in the order they are listed, like reducers on a transition.
- Do **not** run on a transition from a state to itself, such as `transition('input', 'editing')` inside the `editing` state. These self-transitions are commonly used to update context while staying in place, and re-running entry reducers would undo those updates.

Entry reducers and actions are supported by `state` only. They are not supported by [invoke](/docs/invoke/).

## Final state

A state with no [transitions](/docs/transition/) or [immediates](/docs/immediate/). A state that only has entry reducers or actions is still final. In other libraries you have to make a state as final with `{ type: 'final' }` or some other sort of configuration. We don't have a configuration because it is not necessary; by definition a machine with no transitions *cannot* go to another state anyways.

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