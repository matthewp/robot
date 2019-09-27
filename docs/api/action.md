---
layout: api.njk
title: action
tags: api
permalink: api/action.html
---

# action

__action__ takes a function that will be run during a [transition](./transition.html). The primary purpose of using action is to perform *side-effects*.

This example triggers an event on an element when transitioning to the next state.

```js
import { createMachine, action, state, transition } from 'robot3';

function dispatchOn(ctx) {
  const { element } = ctx;
  element.dispatchEvent(new CustomEvent('toggled'));
}

const machine = createMachine({
  on: state(
    transition('toggle', 'off')
  ),
  off: state(
    transition('toggle', 'on',
      action(dispatchOn)
    )
  )
}, () => ({
  element: document.querySelector('#toggler')
}));
```