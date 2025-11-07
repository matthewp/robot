---
title: createMachine
tags: api
permalink: api/createmachine.html
section: api
---

The `createMachine` function creates a state machine. It takes an object of *states* with the key being the state name. The value is usually [state](/docs/state/) but might also be [invoke](/docs/invoke/).


This is a common example that provides 2 states and a [context](#context)

```js
import { createMachine, state } from 'robot3';

const context = () => ({
  first: 'Wilbur',
  last: 'Phillips'
});

const machine = createMachine({
  idle: state(),

  input: state()
}, context);
```

## [initial]

Optionally can provide the initial state as the first argument. If no initial state is provided then the first state listed will be the initial state.

```js
const toggleMachine = initial => createMachine(initial, {
  active: state(
    transition('toggle', 'inactive')
  ),
  inactive: state(
    transition('toggle', 'active')
  )
});

const myMachine = toggleMachine('inactive');
const service = interpret(myMachine, () => {});

console.log(service.machine.current, 'inactive');
```

## states

An object of states, where each key is a state name, and the values are one of [state](/docs/state/) or [invoke](/docs/invoke/).

## context

<code class="api-signature">context(initialContext)</code>

A second argument to `createMachine` is the `context` for the machine; a function that returns an object of [extended state values](https://patterns.eecs.berkeley.edu/?page_id=470#Context). This is useful for storing values coming from places like forms.

The `context` function receives an `initialContext` argument. This is anything passed as the third argument to [interpret](/docs/interpret/) like so:

```js
const context = initialContext => ({
  foo: initialContext.foo
});

const machine = createMachine({
  idle: state()
}, context);

const initialContext = {
  foo: 'bar'
};

interpret(machine, service => {
  // Do stuff when the service changes.
}, initialContext);
```
