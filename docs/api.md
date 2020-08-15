---
layout: page.njk
title: API
tags: page
permalink: api.html
---

Robot exports a variety of functions that compose to build state machines. Many of the functions, such as [state](#state) and [transition](#transition) are [variadic](https://en.wikipedia.org/wiki/Variadic_function), meaning they can take any number of arguments and the order doesn't matter (much). This is a common pattern you'll notice in usage; the result is easier composition.

# Main exports

__Table of Contents__

* [createMachine](./api/createMachine.html)
  * [state](./api/state.html)
    * [transition](./api/transition.html)
      * [guard](./api/guard.html)
      * [reduce](./api/reduce.html)
      * [action](./api/action.html)
    * [immediate](./api/immediate.html)
  * [invoke](./api/invoke.html)
* [interpret](./api/interpret.html)

# Debugging

Robot does not verify the correctness of the state machines you create by default. This is for bundle size purposes; in production you wouldn't want your machines to throw, and this code takes up valuable space.

Instead debugging messages are provided by the __debug module__, `robot3/debug`. Simply import the module anywhere before you call `createMachine`.

A common pattern is to have a `dev.js` that imports the debug module and your main. This way the `dev.js` is not included in your production build.

__dev.js__

```js
import 'robot3/debug';
import './main.js';
```

Or if you're using web modules then include a script tag before your main:

```html
<script type="module" src="https://unpkg.com/robot3/debug"></script>
<script type="module" src="./main.js"></script>
```