---
layout: page.njk
title: Awaiting asynchronous execution
tags: guide
permalink: guides/awaiting-asynchronous-execution.md
---

In a scenario where it's necessary to `await` the machine to enter a `final`
state (a state which has no transitions), the `onChange` callback (the second argument to `interpret`) can be used
to resolve a promise. The promise can be externally awaited.

```js
let resolve;
let promise = new Promise(_resolve => {
  resolve = _resolve;
})

service = interpret(machine, () => {
  if(machine.state.value.final) {
    resolve();
  }
});

await promise;
// All done!
```

This is particularly useful for state machines which consist entirely
of `immediate` and `invoke` states: these model execution flows which do
not depend on external events for their execution and state transition.
