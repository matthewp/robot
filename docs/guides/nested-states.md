---
layout: page.njk
title: Nested States (Hierarchical states)
tags: guide
permalink: guides/nested-states.html
---

Statecharts support [hierarchical states](https://statecharts.github.io/what-is-a-statechart.html) (or nested states) as a way to deal with the [state explosion](https://statecharts.github.io/state-machine-state-explosion.html) problem of traditional finite state machines.

An example of a nested state machine is a crosswalk light. You give the ✋ when the stoplight is __Yellow__ or __Green__. When the stoplight turns __Red__ the crosswalk toggles to 🚶‍♀️. The crosswalk light is a nested state machine of the parent stoplight.

In Robot nested state machines are represented as separate [machines](../api/createMachine.html) with [invoke](../api/invoke.html) used to enter the child machine.

```js
import { createMachine, invoke, state, transition, state as final } from 'robot3';

const stopwalk = createMachine({
  walk: state(
    transition('toggle', 'dontWalk')
  ),
  dontWalk: final()
});

const stoplight = createMachine({
  green: state(
    transition('next', 'yellow')
  ),
  yellow: state(
    transition('next', 'red')
  ),
  red: invoke(stopwalk,
    transition('done', 'green')
  )
});
```

You can transition through these states like so:

```js
let service = interpret(stoplight, () => {});

service.send('next');
console.log(service.machine.current); // yellow

service.send('next');
console.log(service.machine.current); // red

let child = service.child;
console.log(child.machine.current); // walk

child.send('toggle');
console.log(child.machine.current); // dontWalk
console.log(service.machine.current); // green

service.send('next');
console.log(service.machine.current); // yellow

service.send('next');
console.log(service.machine.current); // red

child = service.child;
console.log(child.machine.current); // walk

child.send('toggle');
console.log(child.machine.current); // dontWalk
console.log(service.machine.current); // green
```

Since nested states is a useful feature of state machines you might want to simplify how to define substates. Thanks to Robot's [composition](./composition.html) properties it's easy to create a way declaratively define substates as part of a machine.

Here we create a `nested` function that defines a submachine.

```js
// A helper function for more easily building nested state machines.
const nested = (to, states) => createMachine(states,
  transition('done', to)
);

const stoplight = createMachine({
  green: state(
    transition('next', 'yellow')
  ),
  yellow: state(
    transition('next', 'red')
  ),
  red: nested('green', {
    walk: state(
      transition('toggle', 'dontWalk')
    ),
    dontWalk: final()
  })
});
```