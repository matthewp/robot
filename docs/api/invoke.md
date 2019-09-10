---
layout: api.njk
title: invoke
tags: api
permalink: api/invoke.html
---

# invoke

A special type of [state](./state.html) that immediately invokes a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)-returning function.

__Table of Contents__
@[toc]

When the invoker resolves the [service](./interpret.html) will send the `done` event. The arguments to `invoke` can be any of the same things as [state](./state.html), but will mostly be [transitions](./transition.html).

```js
import { createMachine, immediate, invoke, reduce, state, transition } from '@matthewp/robot';

async function loadUsers() {
  return [ { id: 1, name: 'Wilbur' } ];
}

const machine = createMachine({
  idle: state(
    transition('load', 'loading')
  ),
  loading: invoke(loadUsers,
    transition('done', 'idle',
      reduce((ev, ctx) => ({ ...ctx, user: ev.data }))
    ),
    transition('error', 'error',
      reduce((ev, ctx) => ({ ...ctx, error: ev.error }))
    )
  ),
  error: state()
})
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

Use a [reducer](./reduce.html) to capture the `data` and store the result on the [machine context](./createMachine#context).

```js
import { createMachine, invoke, reduce, state, transition } from '@matthewp/robot';

const machine = createMachine({
  start: invoke(loadTodos,
    transition('done', 'loaded',
      reduce((ev, ctx) => ({ ...ctx, todo: ev.data }))
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
import { createMachine, invoke, reduce, state, transition } from '@matthewp/robot';

const loadTodos = () => Promise.reject("Sorry but you can't do that");

const machine = createMachine({
  start: invoke(loadTodos,
    transition('error', 'error',
      reduce((ev, ctx) => ({ ...ctx, error: ev.error }))
    )
  ),
  error: state()
})
```