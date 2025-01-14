# haunted-robot

## 1.1.0

### Minor Changes

- efbddbe: Typed event for send() in hooks

  This adds the same typed event support for `send()` from hooks, for ex in React:

  ```ts
  const [state, send] = useMachine(machine);

  send("this-is-typed");
  ```

### Patch Changes

- Updated dependencies [efbddbe]
  - robot-hooks@1.1.0

## 1.0.0

### Patch Changes

- Updated dependencies [52742ab]
  - robot3@1.0.0
  - robot-hooks@1.0.0

## 0.3.0

### Minor Changes

- 716c45a: Upgrade to the latest version of Robot
- 716c45a: Upgrade to the latest version of Haunted

### Patch Changes

- Updated dependencies [716c45a]
- Updated dependencies [cce2ae6]
  - robot-hooks@0.4.0
  - robot3@0.4.0
