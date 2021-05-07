---
layout: page.njk
title: robot-hooks
tags: integrations
permalink: integrations/robot-hooks.html
---

# robot-hooks

The __robot-hooks__ package provides the low-level APIs for building hooks for use with Robot finite state machines that works with any hooks supporting libraries.

If you are using React, Preact, or Haunted, you probably want to use those integrations instead.

__Example__

```js
import { createMachine, state, transition } from 'robot3';
import { component, useEffect, useState, html } from 'haunted';
import { createUseMachine } from 'robot-hooks';

const useMachine = createUseMachine(useEffect, useState);

const machine = createMachine({
  idle: state(
    transition('click', 'active')
  ),
  active: state()
});

function App() {
  const [current, send] = useMachine(machine);

  return html`
    <button type="button" @click=${() => send('click')}>
      State: ${current.name}
    </button>
  `;
}

customElements.define('my-app', component(App));
```

## Installation

Install __robot-hooks__ via [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com).

via npm:

```bash
npm install robot-hooks robot3 --save
```

Or Yarn:

```bash
yarn add robot-hooks robot3
```

# Usage

At present the __robot-hooks__ library has one export, `createUseMachine`.

## createUseMachine

__signature__: `createUseMachine(useEffect, useState)`.

The `createUseMachine` function creates a `useMachine` hook. It expects 2 hooks from the parent hooks implementation; [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect) and [useState](https://reactjs.org/docs/hooks-reference.html#usestate). This will work with any hooks library that supports these functions.

### useMachine

__signature__: `useMachine(machine, initialContext)`.

The `useMachine` hook takes a [state machine](../api/createMachine.html) (and optionally an initial context object) and returns a `current` object that represents the current state, and a [send](../api/interpret.html#send) function.

The `send` function is the same as documented [here](../api/interpret.html#send); it sends events into the machine.

`current` is an object with following properties:

* __name__: The name of the state.
* __context__: The service's context object, which contains values derived via [reducers](../api/reduce.html).

```js
const context = initialContext => ({
  ...initialContext,
  page: 23
});

const machine = createMachine({
  one: state(
    transition('go', 'two')
  ),
  two: state()
}, context);

// ... later

function App() {
  const [current, send] = useMachine(machine, { foo: 'bar' });
  const { page } = current.context;

  console.log(current.name); // "one"
  console.log(page); // 23
}
```
