# robot3

## 1.4.0

### Minor Changes

- 6b7bc17: Reducers and actions can now be passed to `state()`, and run whenever the machine enters that state.

  ```js
  const machine = createMachine({
    loading: state(
      reduce((ctx) => ({ ...ctx, error: null })),
      action(showSpinner),
      transition("done", "loaded")
    ),
    loaded: state(),
  });
  ```

  Entry reducers and actions run after the reducers of the transition that led into the state, before the state's immediates are checked, and not on a transition from a state to itself.

### Patch Changes

- 17b2ab2: Fix `immediate()` widening a machine's `send()` event type to `string`

## 1.3.1

### Patch Changes

- 238ba8f: Fix `action()` callbacks returning `-1` corrupting the context.

## 1.3.0

### Minor Changes

- bcc2995: Improve the type definition for state and invoke functions

## 1.2.0

### Minor Changes

- 0cf6366: '/logging' is now exported, so you can import it in your dev environment to log state changes.

  ```ts
  import 'robot3/logging';

  import {...} from 'robot3';
  ```

### Patch Changes

- 950b6fa: Fix syntax error in state function type definition that caused TypeScript compilation failures. The previous change had a missing space in a conditional type expression, breaking type inference for state transitions.

## 1.1.1

### Patch Changes

- 1d6179a: Fixes types for the state() function.

## 1.1.0

### Minor Changes

- 4f6fb69: Autocomplete for service.send()

  This makes it so that the event name in `service.send(event)` is inferred from the transitions used to create the machine.

## 1.0.2

### Patch Changes

- 9fbdbcb: Set the most deeply nested current service to current
- 0409089: Documentation for advanced use of 'invoke()'

## 1.0.1

### Patch Changes

- cc17481: Add debug to package exports

## 1.0.0

### Major Changes

- 52742ab: Call onChange callbacks for immediate states too

## 0.4.1

### Patch Changes

- fc4806e: Adding an export property to the core package.json for 'import' so that destructured imports work, in addition to the default imports handled by the 'default' property

## 0.4.0

### Minor Changes

- cce2ae6: Drop support for Node 14

  This drops support for Node 14, with it no longer being supported by the LTS in February. Robot might still work in Node 14 but is not tested in our CI.
