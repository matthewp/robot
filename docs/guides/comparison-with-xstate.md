---
layout: page.njk
title: Comparison with XState
tags: guide
permalink: guides/comparison-with-xstate.html
---

# Comparison with XState

[XState](https://xstate.js.org) is a popular JavaScript library for building Finite State Machines and [Statecharts](https://statecharts.github.io/) that was an inspiration for creating [Robot](../). Since most people will be choosing to use either XState or Robot, we think it's important to list the various tradeoffs each make. Of course this guide will be biased in favor of Robot's tradeoffs, but we attempt to be fair about them.

XState and Robot share similarities that make them standout from other, more minimal, Finite State Machine libraries:

* Extended state (context) makes it possible to keep non-state values within the machine.
* Both can [invoke](https://www.w3.org/TR/scxml/#invoke) external functions as well as other state machines to perform subtasks.
* Both support [guards](../api/guard.html) to prevent state transitions from occurring on condition.

Below goes into more detail of the various tradeoffs each makes.

__Table of Contents__
@[toc]

## Bundle size

Minified and gzipped XState is __13kB__ at the time of this writing. Robot is __{{ meta.size }}__. This isn't a mistake, keeping the size time is an intentional constraint of Robot. The differences later in this guide are often driven by that constraint.

## Defining machines

In XState, machines are defined using an [options object](https://www.codereadability.com/what-are-javascript-options-objects/). That object is passed to a `Machine` function (not a constructor) that parses that object to produce a machine:

```js
const toggleMachine = Machine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: {
      on: {
        TOGGLE: 'active'
      }
    },
    active: {
      on: {
        TOGGLE: 'inactive'
      }
    }
  }
});
```

Options objects are familiar APIs but have some downsides too. In the above you'll notice that some property keys, like `inactive`, `active`, and `TOGGLE` are domain specific information, whereas some other keys like `states`, `initial`, and `on` are options of the machine. This blending of your stuff with the library's stuff makes it a little harder to read, especially as machines grow.

More importantly, options objects aren't particularly [composable](https://en.wikipedia.org/wiki/Function_composition). A fundamental design constraint of Robot is to aid with [composition](./composition.html). The above machine would be written as:

```js
const toggleMachine = createMachine({
  inactive: state(
    transition('toggle', 'active')
  ),
  active: state(
    transition('toggle', 'inactive')
  )
});
```

### Serialization / Deserialization

XState's machines can be [serialized to JSON](https://xstate.js.org/docs/guides/states.html#persisting-state). This is useful if you want to preserve state.

It's possible to do the same with Robot, but currently it's a little more cumbersome to do. We might add better APIs for serializing state in the future, if it's something people want. Currently you can do so like so:

```js
import { interpret } from 'robot3';
import machine from './some-machine.js';

const currentState = JSON.parse(localState.appState);

// Extend the defined machine setting the current state.
const currentMachine = Object.create(machine, {
  current: { value: currentState.name },
  context: {
    value: () => currentState.context
  }
});

let service = interpret(currentMachine, () => {
  // ...
});
```

## Updating context

In Robot the context is updated using [reduce](../api/reduce.html), which is similar to how state is managed in [Redux](https://redux.js.org/).

```js
import { createMachine, reduce, state, transition } from 'robot3';

const machine = createMachine({
  idle: state(
    transition('inc', 'idle',
      reduce(ctx => ({ ...ctx, count: ctx.count + 1 }))
    )
  )
});
```

In XState the context object is updated through a special [assign](https://xstate.js.org/docs/guides/context.html#updating-context-with-assign) operator. It can work like reduce, but also can take a key to update only 1 value on the context, leaving the others alone.

```js
assign({ count: (ctx, ev) => ctx.count + 1 })
```

## Parallel states

XState supports the Statecharts feature known as [parallel states](https://xstate.js.org/docs/guides/parallel.html). A parallel state machine is one in which the machine can be in multiple states at the same time. You change the states separately and they never affect each other.

An example would be a rich text editor with bold, italic, and underline states. In XState you would write that as:

```js
const toggleStates = {
  initial: 'inactive',
  states: {
    active: {
      on: {
        TOGGLE: 'inactive'
      }
    },
    inactive: {
      on: {
        TOGGLE: 'active'
      }
    }
  }
};

const editorMachine = Machine({
  type: 'parallel',

  states: {
    bold: toggleStates,
    italic: toggleStates,
    underline: toggleStates,
  }
});
```

Robot does not support parallel state machines. Since the states do not affect other states, these are essentially 3 separate machines. In keeping with having 1 way of doing things, we prefer to model these as 3 machines:

```js
const toggleMachine = () => createMachine({
  inactive: state(
    transition('toggle', 'active')
  ),
  active: state(
    transition('toggle', 'inactive')
  )
});

const bold = toggleMachine();
const italic = toggleMachine();
const underline = toggleMachine();
```

## Final state

In Statecharts, a final state is a state that can not be transitioned away from. Both XState and Robot support final states. In XState this is by setting the state's `type`:

```js
const machine = Machine({
  initial: 'loading',

  states: {
    loading: {
      on: { COMPLETE: 'loaded' }
    },
    loaded: {
      type: 'final'
    }
  }
});
```

Since robot uses functions for defining machines, you can simply add a state with no transitions. Since there are no transitions that state is final. I like to alias `state` to `final` to make the final states more obvious:

```js
import { createMachine, state, transition, state as final } from 'robot3';

const machine = createMachine({
  loading: state(
    transition('complete', 'loaded')
  ),
  loaded: final()
});
```

## Actors

XState supports the actor model as an alternative to invoking machines. It's very similar to invoke, except that it doesn't hang off of a state like invoked machines do. Because the use-case is so similar, Robot just sticks with `invoke` for now. I am interested in different ways to spawn new machines, so this is an idea I'm keeping my eye on.

## Delayed transitions

XState supports [delayed transitions](https://xstate.js.org/docs/guides/delays.html), essentially a timeout until moving to another state. In keeping with having one way to do things, in Robot you can just use [invoke](../api/invoke.html) like so:

```js
import { createMachine, invoke, state, transition } from 'robot3';

const wait = ms => () => new Promise(resolve => setTimeout(resolve, ms));

const machine = createMachine({
  green: invoke(wait(1000),
    transition('done', 'yellow')
  ),
  yellow: invoke(wait(500),
    transition('done', 'red')
  ),
  red: invoke(wait(2000),
    transition('done', 'green')
  )
})
```

Because of composition this can be shortened:

```js
import { createMachine, invoke, state, transition } from 'robot3';

const wait = ms => () => new Promise(resolve => setTimeout(resolve, ms));
const light = (next, ms) => invoke(wait(ms),
  transition('done', next)
);

const machine = createMachine({
  green: light('yellow', 1000),
  yellow: light('red', 500),
  red: light('green', 2000)
})
```

## Visualization

XState comes with a [visualizer tool](https://xstate.js.org/viz/) that gives a visual representation of the state machine, and allows you to step through various states and see what the intermediate states look like. Some find this to be a useful way to get the big picture of how the state machine operates. Robot does not have a visualization tool at this time.

## Spec Conformity

XState conforms to the [SCXML](https://www.w3.org/TR/scxml/) specification. Conforming to a standard has the advantage that it is theoretically possible to import and export the XML so that a single machine can be used in multiple languages.

Robot does not conform to the SCXML spec, but rather is inspired by many of the features it includes. I don't believe that reusing machines across languages is very compelling and am focused on the use-cases within web applications.

## Integrations

Robot includes the following integrations with view libraries:

* [React](../integrations/react-robot.html)
* [Preact](../integrations/preact-robot.html)
* [Haunted](../integrations/haunted-robot.html)
* [LitElement](../integrations/lit-robot.html)

XState has the following:

* [React](https://xstate.js.org/docs/packages/xstate-react/)
