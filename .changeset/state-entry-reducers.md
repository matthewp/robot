---
"robot3": minor
---

Reducers and actions can now be passed to `state()`, and run whenever the machine enters that state.

```js
const machine = createMachine({
  loading: state(
    reduce(ctx => ({ ...ctx, error: null })),
    action(showSpinner),
    transition('done', 'loaded')
  ),
  loaded: state()
});
```

Entry reducers and actions run after the reducers of the transition that led into the state, before the state's immediates are checked, and not on a transition from a state to itself.
