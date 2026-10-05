# preact-robot

[Preact](https://preactjs.com/) hooks for use with [Robot](https://regularhuman.dev/).

See documentation on [the website](https://regularhuman.dev/docs/preact-robot/).

```js
import { useMachine } from 'preact-robot';
import { h } from 'preact';
import { html } from 'htm/prect';
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

## 📚 [Documentation](https://regularhuman.dev/docs/preact-robot/)

* Please star [the repository](https://github.com/matthewp/preact-robot) on GitHub.
* [File an issue](https://github.com/matthewp/preact-robot/issues) if you find a bug. Or better yet...
* [Submit a pull request](https://github.com/matthewp/preact-robot/compare) to contribute.

## License

BSD-2-Clause