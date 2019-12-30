---
layout: page.njk
title: Robot - a fast 1kB functional library for creating Finite State Machines
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
* __Composability__: Robot's API is built using *functions*, not a declarative options object. This makes it easy to use [functional composition](./guides/composition.html) to perform common tasks with little code.
* __Understandability__: Instead of conforming to an XML specification created decades ago, Robot takes the best ideas from both academia and real-world usage of finite state machines. This makes state machines easy to read and understand, as there is only one way to do most common tasks.

# Getting Started

Install the `robot3` package via [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com):

```bash
npm install robot3
```

```bash
yarn add robot3
```

This demo shows how to use a Robot to create a loading state machine, including using the state to declaratively render different UI based on the state of the machine.

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
      reduce((ctx, ev) => ({ ...ctx, users: ev.data }))
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

      <button onClick={() => send('fetch')} disabled={disableButton}>
        Load users
      </button>
    </>
  )
}

render(<App />, document.getElementById('app'));
```

# Why Finite State Machines

With Finite State Machines the term __state__ might not mean what you think. In the frontend we tend to think of state to mean *all* of the variables that control the UI. When we say __state__ in Finite State Machines, we mean a higher-level sort of state.

For example, on the GitHub issue page, the issue titles can be edited by the issue creator and repo maintainers. Initially a title is displayed like this:

![Issue title in preview mode](./images/issue-view-mode.png)

The edit button (in red) changes the view so that the title is in an input for editing, and the buttons change as well:

![Issue title in edit mode](./images/issue-edit-mode.png)

If we call this __edit mode__ you might be inclined to represent this state as a boolean and the title as a string:

```js
let editMode = false;
let title = '';
```

When the __Edit__ button is clicked you would toggle the `editMode` variable to `true`. When __Save__ or __Cancel__ are clicked, toggle it back to `false`.

But *oops*, we're missing something here. When you click __Save__ it should keep the changed title and save that via an API call. When you click __Cancel__ it should forget your changes and restore the previous title.

So we have some new states we've discovered, the __cancel__ state and the __save__ state. You might not think of these as states, but rather just some code that you run on events. Think of what happens when you click Save; it makes an external request to a server. That request could fail for a number of reasons. Or you might want to display a loading indicator while the save is taking place. This is definitely a state! __Cancel__, while more simple and immediate, is also a state, as it at least requires some logic to tell the application that the newly inputted title can be ignored.

You can imagine this component having more states as well. What should happen if the user blanks out the input and then clicks save? You can't have an empty title. It seems that this component should have some sort of __validation__ state as well. So we've identified at least 6 states:

* __preview__: The default view when on an issue page.
* __edit__: When in edit mode.
* __save__: When saving to a remote API.
* __error__: When the API server errors for some reason.
* __cancel__: When rolling back changes from edit mode.
* __validate__: When confirming the new input title is an acceptable string.

I'll spare you the code, but you can imagine that writing this logic imperatively can result in a number of bugs. You might be tempted to represent these states as a bunch of booleans:

```js
let editMode = false;
let saving = false;
let validating = false;
let saveHadError = false;
```

And then toggle these booleans in response to the appropriate event. We've all written code this way. You can pull it off, but why do so when you don't have to? Take, for example, what happens when new requirements are added, resulting in yet another new state of this component. You would need to add another boolean, and change all of your code to toggle the boolean as needed.

In recent years there has been a revolution in [declarative programming](https://en.wikipedia.org/wiki/Declarative_programming) in the front-end. We use tools such as [React](https://reactjs.org/) to represent our UI as a function of state. This is great, but we still write imperative code to manage our state like this:

```js
function resetState() {
  setValidating(false);
  setSaving(false);
  setBlurred(false);
  setEditing(false);
  if(!focused) setTouched(false);
  setDirty(true);
}
```

[Finite State Machines](https://en.wikipedia.org/wiki/Finite-state_machine) bring the declarative revolution to application (and component) state. By representing your states declaratively you can __eliminate invalid states__ and prevent an entire category of bugs. Finite State Machines are like static typing for your states.

Robot is a Finite State Machine library meant to be simple, functional, and fun. With Robot you might represent this title component like so:

```js
import { createMachine, guard, immediate, invoke, state, transition, reduce } from 'robot3';

const machine = createMachine({
  preview: state(
    transition('edit', 'editMode',
      // Save the current title as oldTitle so we can reset later.
      reduce(ctx => ({ ...ctx, oldTitle: ctx.title }))
    )
  ),
  editMode: state(
    transition('input', 'editMode',
      reduce((ctx, ev) => ({ ...ctx, title: ev.target.value }))
    ),
    transition('cancel', 'cancel'),
    transition('save', 'validate')
  ),
  cancel: state(
    immediate('preview',
      // Reset the title back to oldTitle
      reduce(ctx => ({ ...ctx, title: ctx.oldTitle }))
    )
  ),
  validate: state(
    // Check if the title is valid. If so go
    // to the save state, otherwise go back to editMode
    immediate('save', guard(titleIsValid)),
    immediate('editMode')
  ),
  save: invoke(saveTitle,
    transition('done', 'preview'),
    transition('error', 'error')
  ),
  error: state(
    // Should we provide a retry or...?
  )
});
```

This *might* seem like a lot of code, but consider that:

* This prevents the component from ever being in an invalid state.
* This captures *all* of the possible states. When writing imperative code you often ignore uncommon or inconvenient states like errors. With Finite State Machines it's much harder to ignore reality.
* States and transitions are validated at the moment that the machine is created and will throw when using [robot/debug](./api.html#debugging).

# Inspiration

Robot is inspired by a variety of projects involving finite state machines including:

* [Statecharts](http://www.inf.ed.ac.uk/teaching/courses/seoc/2005_2006/resources/statecharts.pdf): The specification that fixes some of the issues with Finite State Machines. Robot adopts a number of these changes.
* [XState](https://xstate.js.org): The excellent JavaScript library that implements the Statecharts XML spec.
* [The P programming language](https://github.com/p-org/P/wiki/PingPong-program): A DSL for representing Finite State Machines.
