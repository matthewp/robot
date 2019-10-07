---
layout: page.njk
title: lit-robot
tags: integrations
permalink: integrations/lit-robot.html
---

# lit-robot

__Table of Contents__
@[toc]

The __lit-robot__ package provides a class mixin, `Robot`, that adds state machines to element classes. This allows controlling the internal state of your element using the state machine.

```js
import { createMachine, state, transition } from 'robot3';
import { LitElement, html } from 'lit-element';
import { Robot } from 'lit-robot';

const machine = createMachine({
  off: state(
    transition('toggle', 'on')
  ),
  on: state(
    transition('toggle', 'off')
  )
});

class App extends Robot(LitElement) {
  static machine = machine;

  render() {
    let { send } = this.service;
    let current = this.machine.state;

    return html`
      <div>State: ${current.name}</div>
      <button @click=${() => send('toggle')}>
        Toggle
      </button>
    `;
  }
}

customElements.define('my-app', component(App));
```

## Installation

Available as `lit-robot` on [npm](https://www.npmjs.com/package/lit-robot):

```bash
npm install lit-robot --save
```

Or through [Yarn](https://yarnpkg.com):

```bash
yarn add lit-robot
```

## API

### Robot

<code class="api-signature">Robot(BaseElement)</code>

The `Robot` export from lit-robot (ie, `import { Robot } from 'lit-robot';`) is a function that takes a base class to apply its mixin on top of. LitElement __must__ be part of the chain, lit-robot does not without LitElement.

```js
import { LitElement } from 'lit-element';
import { Robot } from 'lit-robot';

const RobotElement = Robot(LitElement);
```

#### static machine

<code class="api-signature">static machine = machine;</code>

Sets the static `machine` property on the element. This is the [state machine](../api/createMachine.html) that will be used as part of the element's lifecycle. It can be passed in like so:

```js
const appMachine = createMachine({
  one: state()
});

class MyApp extends Robot(LitElement) {
  static machine = appMachine;
}
```

#### machine

<code class="api-signature">this.machine</code>

Inside of the element instance there will be a `this.machine` property that is the extended state machine being interpreted. It contains all of the same API properties as [Robot state machines](../api/createMachine.html).

Use it inside of `render()`, for example, to get the current state name:

```js
render() {
  let current = this.machine.state;

  return html`
    <div>State: ${current.name}</div>
  `;
}
```

#### service

<code class="api-signature">this.service</code>

The state machine service created via [interpret](../api/interpret.html). This is used to send events into the state machine to cause transitions, actions to run, etc.

```js
render() {
  let { send } = this.service;

  return html`
    <button @click=${() => send('toggle')}>
      Toggle
    </button>
  `;
}
```

## Setting the element on context

Some times you might want to perform side-effects on the element instance within a state machine. The best way to do that is to have the element on the context object. The context function receives an event that contains an `element` property. Use that to establish your initial context.

Once the element is on your context you can use [actions](../api/action.html) to perform side-effects.

```js
import { createMachine, action, state, transition } from 'robot3';
import { Robot } from 'lit-robot';
import { LitElement } from 'lit-element';

const context = initialContext => ({
  element: initialContext.element
});

const machine = createMachine({
  idle: state(
    transition('next-page',
      action((ctx, ev) => {
        ctx.element.setAttribute('page', ev.page);
      })
    )
  )
}, context);

class MyApp extends Robot(LitElement) {
  static machine = machine;
}

customElements.define('my-app', MyApp);
```

## License

[BSD 2-Clause](https://opensource.org/licenses/BSD-2-Clause)