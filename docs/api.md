---
layout: api.njk
title: API
tags: page
permalink: api.html
---

Robot exports a variety of functions that compose to build state machines. Many of the functions, such as [state](#state) and [transition](#transition) are [variadic](https://en.wikipedia.org/wiki/Variadic_function), meaning they can take any number of arguments and the order doesn't matter (much). This is a common pattern you'll notice in usage; the result is easier composition.

__Table of Contents__

@[toc]

# createMachine

The `createMachine` function creates a state machine. It takes an object of *states* with the key being the state name. The value is usually [state](#state) but might also be [invoke](#invoke).

A second argument is the `context` for the machine; a function that returns an object of [extended state values](https://patterns.eecs.berkeley.edu/?page_id=470#Context). This is useful for storing values coming from places like forms.

```js
import { createMachine, state } from '@matthewp/robot';

const context = () => ({
  first: 'Wilbur',
  last: 'Phillips'
});

const machine = createMachine({
  idle: state(),

  input: state()
}, context);
```

## state

The `state` export is a function that returns a state object. A state can take [transitions](#transition), [immediates](#immediates) as arguments.

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

### transition

A __transition__ is used to move from one state to another. Transitions are triggered by *events*, the first argument to the `transition` function. The second argument is the *destination state*.

Optionally you can add [guards](#guard) and [reducers](#reduce) to transitions. Guards will be applied first; if a guard returns `false` the reducers will not run.

Transitions are *always* a child of either [state](#state) or [invoke](#invoke) types. Here's a typical transition from one state to another:

```js
import { createMachine, state, transition } from '@matthewp/robot';

const machine = createMachine({
  sleep: state(
    transition('wake', 'breakfast')
  ),
  breakfast: state(
    transition('eat', 'work')
  )
});
```

And similarly when used with an [invoke](#invoke) state:

```js
import { createMachine, invoke, state, transition } from '@matthewp/robot';
import { loadUsers } from './api.js';

const machine = createMachine({
  idle: state(
    transition('load', 'loading')
  )
  loading: invoke(loadUsers,
    transition('done', 'show',
      reduce((ev, ctx) => ({ ...ctx, users: ev.data })))
  )
}, () => ({ users: [] }));
```

There can be __multiple transitions__ for the same event, in which case the first will be chosen if its [guards](#guard) pass:

```js
import { createMachine, guard, state, transition } from '@matthewp/robot';

const machine = createMachine({
  shopping: state(
    transition('buy', 'food',
      guard(amHungry)
    ),
    transition('buy', 'clothes')
  )
});
```

#### guard

A __guard__ is a method that determines if a transition can proceed. Returning `true` allows the transition to occur, returning `false` prevents it from doing so and leaves the state in its current place.

```js
import { createMachine, guard, state, transition } from '@matthewp/robot';

// Only allow submission of a login and password is entered.
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

#### reduce

__reduce__ takes a reducer function for changing the [context](#createMachine) of the machine. A common use case is to set values coming from form fields.

In this example are implementing a login form that sets the `login` and `password` properties on the context.

```js
import { createMachine, reduce, state, transition } from '@matthewp/robot';

const machine = createMachine({
  idle: state(
    transition('login', 'idle',
      reduce((ev, ctx) => ({ ...ctx, login: ev.target.value }))
    ),
    transition('password', 'idle',
      reduce((ev, ctx) => ({ ...ctx, password: ev.target.value }))
    ),
    transition('submit', 'complete')
  ),
  complete: state()
});
```

### immediate

An __immediate__ is a type of transition that occurs immediate; it doesn't wait for an event to proceed. This is a state that immediate proceeds to the next:

```js
import { createMachine, reduce, state, transition } from '@matthewp/robot';

const machine = createMachine({
  breakfast: state(
    immediate('work')
  ),
  work: state()
});
```

Typically an immediate is used in conjunction with a [guard](#guard) or [reducer](#reduce). A common pattern is to have an intermediate state that uses immediates and guards to determine which next state should be proceeded to. I use this pattern often with *validation*:

```js
import { createMachine, reduce, state, transition } from '@matthewp/robot';

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

## invoke

# interpret