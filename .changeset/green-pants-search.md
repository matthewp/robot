---
"robot-hooks": minor
"haunted-robot": minor
"preact-robot": minor
"react-robot": minor
---

Typed event for send() in hooks

This adds the same typed event support for `send()` from hooks, for ex in React:

```ts
const [state, send] = useMachine(machine);

send('this-is-typed');
```