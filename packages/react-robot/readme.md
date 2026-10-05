# react-robot

[React](https://reactjs.org/) hooks for use with [Robot](https://regularhuman.dev/) finite state machines.

See documentation on [the website](https://regularhuman.dev/docs/react-robot/).

```js
import { useMachine } from 'react-robot';
import React from 'react';
import { createMachine, state, transition } from 'robot3';

const machine = createMachine({
  one: state(
    transition('next', 'two')
  ),
  two: state()
});

function App() {
  const [current, send] = useMachine(machine);
  
  return html`
    <button type="button" onClick=${() => send('next')}>
      State: ${current.name}
    </button>
  `;
}
```

## 📚 [Documentation](https://regularhuman.dev/docs/react-robot/)

* Please star [the repository](https://github.com/matthewp/react-robot) on GitHub.
* [File an issue](https://github.com/matthewp/react-robot/issues) if you find a bug. Or better yet...
* [Submit a pull request](https://github.com/matthewp/react-robot/compare) to contribute.

## License

BSD-2-Clause