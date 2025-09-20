---
title: svelte-robot-factory
tags: integrations
permalink: integrations/svelte-robot-factory.html
section: integrations
---

# [svelte-robot-factory](https://github.com/kayodebristol/svelte-robot-factory)

Table of Contents

- [svelte-robot-factory](#svelte-robot-factory)
  - [Installation](#installation)
  - [API](#api)
  - [Example](#example)
  - [Sveltekit](#sveltekit)
  - [License](#license)

The svelte-robot-factory returns a svelte writable store which implements a robot machine service.

## Installation

npm:

```bash
npm install svelte-robot-factory robot3 --save
```

yarn:

```bash
yarn add svelte-robot-factory robot3
```

## API

```javascript
useMachine(machine, event);
```

Arguments:

- [machine](/docs/interpret/#machine): Robot state machine
- [event](https://thisrobot.life/api/interpret.html#event): Object which will be passed to the [context function](/docs/createMachine/#context)

Returns:

- [Writable svelte store](https://svelte.dev/docs#writable) which implements a robot [service](/docs/interpret/#service) on subscribe

```javascript
function useMachine(machine, event)
    const {subscribe, set} = writable(
        interpret(machine, service => set(service), event)
    )
    return {subscribe}
}
```

## Example

[View in REPL](https://svelte.dev/repl/a9904c210b474bd2ab71d9b7c26c4c38?version=3.12.1)

```js
<!--
  example integration with https://thisrobot.life
	supports send, context, and machine (to include machine.current & machine.state)
-->

<script>
  import service from './store.js';
  import Child from './Child.svelte'
  const send = $service.send;
  $: current = $service.machine.current
</script>

<div>Current state value: {current}</div>
<Child/>

<button on:click={() => send('toggle')}>
  Toggle
</button>
```

```js
/// Child.svelte
<script>
  import service from './store.js';
  $: foo = $service.context.foo;
</script>

<div>Context value of foo property: {foo}</div>
```

```js
/// store
import { createMachine, state, transition, invoke, reduce } from 'robot3';
import { useMachine } from 'svelte-robot-factory';
const context = event => ({
  foo: event.foo
});
const event = {
  foo: 'initial'
};
const machine = createMachine({
  inactive: state(
    transition('toggle', 'active',
      reduce((ctx, ev)=>({ ...ctx, foo: 'bar'}))
    )
  ),
  active: state(
    transition('toggle', 'inactive',
      reduce((ctx, ev)=>({ ...ctx, foo: 'foo'}))
    )
  )
}, context);

const service = useMachine(machine, event);
export default service;
```
## Sveltekit

Due to a [known issue with vite handling of commonjs modules](https://github.com/sveltejs/kit/issues/928), when used with sveltekit, add prebundleSvelteLibraries: true, to your svelte.config.js.

For example, [svelte.config.js]

```javascript
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	experimental: {
		prebundleSvelteLibraries: true
	},
	kit: {
		adapter: adapter()
	}
};

export default config;
```

Or, reference the [sveltekit-toggle]https://github.com/kayodebristol/svelte-robot-factory/tree/master/example/sveltekit-toggle) example.
## License

**[MIT](https://opensource.org/licenses/MIT)**