# haunted-robot

[Haunted](https://github.com/matthewp/haunted) hooks for use with [Robot](https://regularhuman.dev/).

See documentation on [the website](https://regularhuman.dev/docs/haunted-robot/).

```js
import { useMachine } from 'haunted-robot';
import { html, component } from 'haunted';
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
    <button type="button" @click=${() => send('next')}>
      State: ${current.name}
    </button>
  `;
}

customElements.define('my-app', component(App));
```

## 📚 [Documentation](https://regularhuman.dev/docs/haunted-robot/)

* Please star [the repository](https://github.com/matthewp/haunted-robot) on GitHub.
* [File an issue](https://github.com/matthewp/haunted-robot/issues) if you find a bug. Or better yet...
* [Submit a pull request](https://github.com/matthewp/haunted-robot/compare) to contribute.

## License

BSD-2-Clause