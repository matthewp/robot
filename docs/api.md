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

## transition

A __transition__ is used to move from one state to another. Transitions are triggered by *events*, the first argument to the `transition` function. The second argument is the *destination state*.

Optionally you can add [guards](#guard) and [reducers](#reduce) to transitions. Guards will be applied first; if a guard returns `false` the reducers will not run.

# interpret