# lit-robot

[LitElement](https://lit-element.polymer-project.org/) integration with [Robot](https://thisrobot.life/).

See documentation on [the website](https://thisrobot.life/integrations/lit-robot.html).

```js
import { Robot } from 'lit-robot';
import { LitElement, html } from 'lit-element';
import { html } from 'htm/prect';

class MyApp extends Robot(LitElement) {
  static machine = createMachine({
    one: state(
      transition('next', 'two')
    ),
    two: state()
  });

  render() {
    let { send } = this.service;
    let current = this.machine.state;

    return html`
      <button type="button" @click=${() => send('next')}>
        State: ${current.name}
      </button>
    `;
  }
}
```

## 📚 [Documentation](https://thisrobot.life/integrations/lit-robot.html)

* Please star [the repository](https://github.com/matthewp/robot) on GitHub.
* [File an issue](https://github.com/matthewp/robot/issues) if you find a bug. Or better yet...
* [Submit a pull request](https://github.com/matthewp/robot/compare) to contribute.

## License

BSD-2-Clause