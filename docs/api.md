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

## Examples of excluding a debug module from a production build

### 1. dev.js

A common pattern is to have a `dev.js` that imports the debug module and your main. This way the `dev.js` is not included in your production build.

__dev.js__

```js
import 'robot3/debug';
import './main.js';
```

### 2. Web Modules

If you're using web modules then include a script tag before your main:

```html
<script type="module" src="https://unpkg.com/robot3/debug"></script>
<script type="module" src="./main.js"></script>
```

### 3. Logging

The __logging module__ `robot3/logging` provides a helper function which logs state changes when entering a new state. It can be used as the __debug module__ by importing it or including the script before the main. 

```html
<script type="module" src="https://unpkg.com/robot3/logging"></script>
<script type="module" src="./main.js"></script>
```

This method can also be overwritten with a more advanced solution.

```js
import {d} from 'robot3';

d._onEnter = function(machine, to, state, prevState, event) {
 // compare states and log the differences
}
```

### 4. Stripping with Module Bundler

#### 4.1. Rollup

You can use some Rollup-plugins for excluding __debug module__ from production bundle. The easiest option is to use [rollup-plugin-strip-code](https://www.npmjs.com/package/rollup-plugin-strip-code).

__rollup.config.js__

```js
import stripCode from 'rollup-plugin-strip-code';

// Assuming you'd run it with something like 'rollup -c --environment BUILD:production'
const isProduction = process.env.BUILD === 'production';

export default [
  input: ...,
  output: ...,
  plugins: [
    ...,
    isProduction && stripCode({
      start_comment: 'START.DEBUG_ONLY',
      end_comment: 'END.DEBUG_ONLY',
    })
  ]
];
```

__stateMachine.js__

```js
/*START.DEBUG_ONLY*/
import 'robot3/debug';
/*END.DEBUG_ONLY*/

import {...} from 'robot3';
```

Also you can use official [@rollup/plugin-alias](https://www.npmjs.com/package/@rollup/plugin-alias) to mock ```import 'robot3/debug'```, but this approach needs empty mock-file for replacement, what is not so clean.

__rollup.config.js__

```js
import alias from '@rollup/plugin-alias';

module.exports = {
  input: ...,
  output: ...,
  plugins: [
    ...,
    alias({
      entries: [
        { find: 'robot3/debug', replacement: resolve(__dirname, './src/mocks/empty.js') },
      ]
    })
  ]
};
```

__mocks/empty.js__ is empty file.

#### 4.2. Webpack

Similarly to Rollup you can use [webpack-strip-block](https://www.npmjs.com/package/webpack-strip-block) to strip __debug module__ from production bundle.
