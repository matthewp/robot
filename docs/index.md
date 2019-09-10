---
layout: page.njk
title: Robot
---

With __Robot__ you can build [finite state machines](https://brilliant.org/wiki/finite-state-machines/) in a simple and flexible way. Robot emphasizes:

* __Size__: at just *{{ meta.size }}* you get a big bang for your buck.
* __Composability__: Robot's API are built using *functions*, not a declative options object. This makes it easy to use functional composition to perform common tasks with little code.
* __Understandability__: Instead of conforming to an XML specification created decades ago, Robot takes the best ideas from both academia and real-world usage of finite state machines. This makes state machines easy to read and understand, as there is only one way to do most common tasks.

Here's the classic stoplight example state machine using Robot:

```js
import { createMachine, interpret, state, transition } from '@matthewp/robot';

let machine = createMachine({
  red: state(
    transition('timer', 'green')
  ),
  yellow: state(
    transition('timer', 'red')
  ),
  green: state(
    transition('timer', 'yellow')
  )
});

const service = interpret(machine, ({ context }) => {
  render(context);
});

function render({ first, last }) {

}
```

