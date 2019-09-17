# 🤖 Robot

A small functional and immutable Finite State Machine library. Using state machines for your components brings the declarative programming approach to application state.

See [thisrobot.life](https://thisrobot.life/) for the main documentation.

```js
import { createMachine, interpret, state, transition } from 'robot3';

let machine = createMachine({
  off: state(
    transition('toggle', 'on')
  ),
  on: state(
    transition('toggle', 'off')
  )
});

const service = interpret(machine, () => {
  render();
});
```

## 📚 [Documentation](https://thisrobot.life/)

* Please star [the repository](https://github.com/matthewp/robot) on GitHub.
* [File an issue](https://github.com/matthewp/robot/issues) if you find a bug. Or better yet...
* [Submit a pull request](https://github.com/matthewp/robot/compare) to contribute.

## Testing

Tests are located in the `test/` folder. Load `test/test.html` in your browser of choice with any HTTP server you like (I use [http-server](https://www.npmjs.com/package/http-server)). Tests are written in [QUnit](https://qunitjs.com/) and are simple to understand.

## Integrations

Robot works with a variety of UI libraries, and includes integrations for React, Preact, Haunted, and more. See the [integrations page](https://thisrobot.life/integrations.html) to learn more.

## License

BSD-2-Clause