---
layout: api.njk
title: options
tags: api
permalink: api/options.html
---

# options

Supply __options__ to configure the behaviour of invoke.  Specify the event names to trigger on `success` or `failure`:

```js
import { createMachine, state, invoke, options } from 'robot3';

const machine = createMachine({
  start: invoke(runTask,
    options({ success: 'yay', failure: 'nay' }),
    transition('yay', 'complete'),
    transition('nay', 'error')
  ),
  complete: state(),
  error: state()
});
```
