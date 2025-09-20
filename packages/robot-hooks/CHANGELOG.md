# robot-hooks

## 1.1.0

### Minor Changes

- efbddbe: Typed event for send() in hooks

  This adds the same typed event support for `send()` from hooks, for ex in React:

  ```ts
  const [state, send] = useMachine(machine);

  send("this-is-typed");
  ```

## 1.0.1

### Patch Changes

- 9fbdbcb: Set the most deeply nested current service to current
- Updated dependencies [9fbdbcb]
- Updated dependencies [0409089]
  - robot3@1.0.2

## 1.0.0

### Patch Changes

- Updated dependencies [52742ab]
  - robot3@1.0.0

## 0.4.0

### Minor Changes

- 716c45a: Upgrade to the latest version of Robot

### Patch Changes

- Updated dependencies [cce2ae6]
  - robot3@0.4.0
