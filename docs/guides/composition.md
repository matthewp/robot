---
layout: page.njk
title: Composition
tags: guide
permalink: guides/composition.html
---

One of the goals of Robot is to make Finite State Machines more composable. In other implementations you create a machine by constructing a large [options object](https://www.codereadability.com/what-are-javascript-options-objects/) with all of the machine's states, transitions, etc. This makes it a bit harder to reuse useful parts of the machine.

When using Robot you'll notice how easy it is to break up reusable parts. This is thanks to its [composition over configuration](https://johno.com/composition-over-configuration) nature. For example, take this full name machine:

```js
import { createMachine, state, reduce, transition } from 'robot3';

const machine = createMachine({
  form: state(
    transition('first', 'form',
      reduce((ctx, ev) => ({ ...ctx, first: ev.event.target.value }))
    ),
    transition('last', 'form',
      reduce((ctx, ev) => ({ ...ctx, last: ev.event.target.value }))
    )
  )
});
```

This, and many form fields like it, follow a similar pattern:

1. Listen for an event that is named the same as the property, `first` and `last` in this case.
1. Run a [reducer](../api/reduce.html) to save the value to the [machine context](../api/createMachine.html#context).
1. Return to the original state, `form`, to wait for the next event.

We can improve this by creating a generic `field` function like so:

```js
import { createMachine, state, reduce, transition } from 'robot3';

const field = (prop, state) => (
  transition(prop, state,
    reduce((ctx, ev) => ({ ...ctx, [prop]: ev.event.target.value }))
  )
);

const formField = (prop) => field(prop, 'form');

const machine = createMachine({
  form: state(
    formField('first'),
    formField('last')
  )
});
```

Since this is such a common pattern you might want to move these types of reusable transitions to their own module:

__transitions.js__

```js
export const field = (prop, state) => (
  transition(prop, state,
    reduce((ctx, ev) => ({ ...ctx, [prop]: ev.event.target.value }))
  )
);

export const formField = (prop) => field(prop, 'form');
```

Making your machine codes much more succinct:

```js
import { createMachine, state } from 'robot3';
import { formField } from './transitions.js';

const machine = createMachine({
  form: state(
    formField('first'),
    formField('last')
  )
});
```

You might find that you need a *slight* modification to how one of the transitions works. For example, we want to put a limit to `first` at only 10 characters. We can change our `field` transition to take additional arguments:

```js
export const field = (prop, state, ...args) => (
  transition(prop, state,
    reduce((ctx, ev) => ({ ...ctx, [prop]: ev.event.target.value })),
    ...args
  )
);

export const formField = (prop, ...args) => field(prop, 'form', ...args);
```

And use a [guard](../api/guard.html) in our usage:

```js
import { createMachine, guard, state } from 'robot3';
import { formField } from './transitions.js';

const machine = createMachine({
  form: state(
    formField('first',
      guard((ctx) => ctx.first.length <= 10)
    ),
    formField('last')
  )
});
```

I'm hopeful common useable patterns like the above will make their way to [npm](https://www.npmjs.com/) and an ecosystem emerges.
