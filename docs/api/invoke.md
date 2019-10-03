---
layout: api.njk
title: invoke
tags: api
permalink: api/invoke.html
---

# invoke

__Table of Contents__
@[toc]

A special type of [state](./state.html) that immediately invokes a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)-returning function or another [machine](./createMachine.html).

When the invoker resolves the [service](./interpret.html) will send the `done` event. The arguments to `invoke` can be any of the same things as [state](./state.html), but will mostly be [transitions](./transition.html).

```js
import { createMachine, immediate, invoke, reduce, state, transition } from 'robot3';

async function loadUsers() {
  return [ { id: 1, name: 'Wilbur' } ];
}

const machine = createMachine({
  idle: state(
    transition('load', 'loading')
  ),
  loading: invoke(loadUsers,
    transition('done', 'idle',
      reduce((ctx, ev) => ({ ...ctx, user: ev.data }))
    ),
    transition('error', 'error',
      reduce((ctx, ev) => ({ ...ctx, error: ev.error }))
    )
  ),
  error: state()
})
```

## Promises

Robot will wait for another Promise-returning function to complete before firing the `done` event. Notice that it must be a *function*, not a promise itself. So if you have an existing promise you can wrap a function around it like so:

```js
import { creatMachine, invoke, state, transition } from 'robot3';
import loadStuff from './important-stuff.js';

const promise = loadStuff();

const machine = createMachine({
  loading: invoke(() => promise,
    transition('done', 'next')
  ),
  next: state()
})
```

## Machines

Robot can also invoke other __machines__. This can be a useful way to separate concerns. Child machines can be invoked to do tasks not within the scope of the parent machine.

When [interpreting](./interpret.html) a machine and a child machine is invoked, the [onChange callback](./interpret.html#onchange) is invoked with the child service like so:

```js
import { createMachine, invoke, reduce, state, state as final, transition } from 'robot3';

const inputMachine = createMachine({
  idle: state(
    transition('input', 'validate')
  ),
  validate: state(
    immediate('finished')
  ),
  finished: final()
});

const wizardMachine = createMachine({
  step1: invoke(inputMachine,
    transition('done', 'step2',
      reduce((ctx, ev) => ({ ...ctx, childContext: ev.data }))
    )
  ),
  step2: state() // Machine another machine here?
});

let service = interpret(wizardMachine, innerService => {
  if(service !== innerService) {
    // This must be the `inputMachine` service.
  }
});
```

Additionally the parent service will have a `child` property which is the child service. You can send it events the same way as you would any service:

```js
service.child.send('input');
```

## Events

An `invoke` state will trigger one of the following events upon completion:

### done

When the Promise resolves successfully the `done` event is sent through the machine. Use a [transition](./transition.html) to capture this event and proceed as you might with any other event.

The event includes a `data` property that contains the data from the resolved Promise.

```json
{
  "type": "done",
  "data": [
    { "id": 1, "name": "Wilbur" }
  ]
}
```

Use a [reducer](./reduce.html) to capture the `data` and store the result on the [machine context](./createMachine.html#context).

```js
import { createMachine, invoke, reduce, state, transition } from 'robot3';

const machine = createMachine({
  start: invoke(loadTodos,
    transition('done', 'loaded',
      reduce((ctx, ev) => ({ ...ctx, todo: ev.data }))
    )
  ),
  loaded: state()
}, () => ({ todos: [] }))
```

### error

The `error` event is sent through the machine in the case where the Promise rejects. Use this event to capture the error and move to an error state, so you can show your users an error message, retry, or handle errors some other way.

The event includes an `error` property which is the [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) provided by the Promise rejection.

```json
{
  "type": "error",
  "error": {...}
}
```

Use [reducers](./reduce.html) to save the error to your machine context, if you wish to present the error to the user.

```js
import { createMachine, invoke, reduce, state, transition } from 'robot3';

const loadTodos = () => Promise.reject("Sorry but you can't do that");

const machine = createMachine({
  start: invoke(loadTodos,
    transition('error', 'error',
      reduce((ctx, ev) => ({ ...ctx, error: ev.error }))
    )
  ),
  error: state()
})
```
