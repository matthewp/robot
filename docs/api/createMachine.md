---
layout: api.njk
title: createMachine
tags: api
permalink: api/createMachine.html
---

# createMachine

The `createMachine` function creates a state machine. It takes an object of *states* with the key being the state name. The value is usually [state](./state.html) but might also be [invoke](./invoke.html).

__Table of Contents__
@[toc]

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

## states

An object of states, where each key is a state name, and the values are one of [state](./state.html) or [invoke](./invoke.html).

## context

<code class="api-signature">context(event)</code>

A second argument to `createMachine` is the `context` for the machine; a function that returns an object of [extended state values](https://patterns.eecs.berkeley.edu/?page_id=470#Context). This is useful for storing values coming from places like forms.

The `context` function receives an `event` argument. This is anything passed as the third argument to [interpret](./interpret.html) like so:

```js
const context = event => ({
  foo: event.foo
});

const machine = createMachine({
  idle: state()
}, context);

const event = {
  foo: 'bar'
};

interpret(machine, service => {
  // Do stuff when the service changes.
}, event);
```