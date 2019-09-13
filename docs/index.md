---
layout: page.njk
title: Robot
id: home
shortTitle: Home
tags: page
date: 2019-09-01
---

# Robot

* [Getting Started](#getting-started)
* [Why Finite State Machines](#why-finite-state-machines)

With __Robot__ you can build [finite state machines](https://brilliant.org/wiki/finite-state-machines/) in a simple and flexible way.

```js
import { createMachine, state, transition } from 'robot3';

const machine = createMachine({
  inactive: state(
    transition('toggle', 'active')
  ),
  active: state(
    transition('toggle', 'inactive')
  )
});

export default machine;
```

Which you can use easily with any of our [integrations](./integrations.html):

```js
import { h } from 'preact';
import { useMachine } from 'preact-robot';
import machine from './machine.js';

function Counter() {
  const [current, send] = useMachine(machine);
  const state = current.name;

  return (
    <>
      <div>State: {state}</div>
      <button onClick={() => send('toggle')}>
        Toggle
      </button>
    </>
  );
}
```

Robot emphasizes:

* __Size__: at just *{{ meta.size }}* you get a big bang for your buck.
* __Composability__: Robot's API are built using *functions*, not a declative options object. This makes it easy to use [functional composition](./composition.html) to perform common tasks with little code.
* __Understandability__: Instead of conforming to an XML specification created decades ago, Robot takes the best ideas from both academia and real-world usage of finite state machines. This makes state machines easy to read and understand, as there is only one way to do most common tasks.

# Getting Started

Install the `robot3` package via [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com):

```bash
npm install robot3 --dev
```

```bash
yarn add robot3
```

This demo shows how to use a Robot to create a loading state machine, including using the state to declarative render different UI based on the state of the machine.

```js
import { createMachine, invoke, reduce, state, transition } from 'robot3';
import { useMachine } from 'preact-robot';
import { h, render } from 'preact';

const context = () => ({
  users: []
});

async function loadUsers() {
  return [
    { id: 1, name: 'Wilbur' },
    { id: 2, name: 'Matthew' },
    { id: 3, name: 'Anne' }
  ];
}

const machine = createMachine({
  idle: state(
    transition('fetch', 'loading')
  ),
  loading: invoke(loadUsers,
    transition('done', 'loaded',
      reduce((ev, ctx) => ({ ...ctx, users: ev.data }))
    )
  ),
  loaded: state()
}, context);

function App() {
  const [current, send] = useMachine(machine);
  const state = current.name;
  const { users } = current.context;
  const disableButton = state === 'loading' || state === 'loaded';

  return (
    <>
      {state === 'loading' ? (
        <div>Loading users...</div>
      ) : state === 'loaded' ? (
        
        <ul>
          {users.map(user => {
            <li id={`user-${user.id}`}>{user.name}</li>
          })}
        </ul>

      ): ()}

      <button onClick={()} disabled={disableButton}>
        Load users
      </button>
    </>
  )
}

render(<App />, document.getElementById('app'));
```

# Why Finite State Machines

# Inspiration

Robot is inspired by a variety of projects involving finite state machines including:

* [Statecharts](http://www.inf.ed.ac.uk/teaching/courses/seoc/2005_2006/resources/statecharts.pdf)
* [XState](https://xstate.js.org)
* [The P programming language](https://github.com/p-org/P/wiki/PingPong-program)