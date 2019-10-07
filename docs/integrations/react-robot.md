---
layout: page.njk
title: react-robot
tags: integrations
permalink: integrations/react-robot.html
---

# react-robot

__Table of Contents__
@[toc]

The __react-robot__ package provides the `useMachine` [hook](https://reactjs.org/docs/hooks-intro.html) for use with [React](https://reactjs.org/).

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createMachine, state, transition } from 'robot3';
import { useMachine } from 'react-robot';

const machine = createMachine({
  off: state(
    transition('toggle', 'on')
  ),
  on: state(
    transition('toggle', 'off')
  )
});

function App() {
  const [current, send] = useMachine(machine);

  return (
    <>
      <div>State: {current.name}</div>
      <button onClick={() => send('toggle')}>
        Toggle
      </button>
    </>
  );
}

ReactDOM.render(<App />, document.querySelector('#app'));
```

## Installation

Available as `react-robot` on [npm](https://www.npmjs.com/package/react-robot):

```bash
npm install react-robot --save
```

Or through [Yarn](https://yarnpkg.com):

```bash
yarn add react-robot
```

## API

<code class="api-signature">useMachine(machine, initialContext)</code>

Includes the __arguments__:

* `machine`: A Robot [state machine](../api/createMachine.html).
* `initialContext`: An object that will be passed to the [context function](../api/createMachine.html#context).

__Returns__ the following as an array:

`[current, send, service]`

* `current`: A __state__ object with the properties:
  * `name`: The name of the state (like `off` from the above example).
  * `context`: The [context](../api/createMachine.html#context) object for the [service](../api/interpret.html#service).
* `service`: A [service](../api/interpret.html#service) like you normally get from [interpret](../api/interpret.html).

Normally only the `current` and `send` properties are needed to be used.

Here the state `name` is logged, as well as data from the [context](../api/createMachine.html#context).

```js
const [current, send] = useMachine(machine);
const { userName } = current.context;

console.log('Current state:', current.name);
console.log('Username from context', userName);
```

The `send` property is used to send events into the state machine:

```js
const [current, send] = useMachine(machine);

return (
  <button onClick={() => send('toggle')}>
    Toggle
  </button>
);
```

## License

[BSD 2-Clause](https://opensource.org/licenses/BSD-2-Clause)