---
layout: page.njk
title: API
tags: page
permalink: api.html
---

Robot exports a variety of functions that compose to build state machines. Many of the functions, such as [state](#state) and [transition](#transition) are [variadic](https://en.wikipedia.org/wiki/Variadic_function), meaning they can take any number of arguments and the order doesn't matter (much). This is a common pattern you'll notice in usage; the result is easier composition.

__Table of Contents__

* [createMachine](./api/createMachine.html)
  * [state](./api/state.html)
    * [transition](./api/transition.html)
      * [guard](./api/guard.html)
      * [reduce](./api/reduce.html)
    * [immediate](./api/immediate.html)
  * [invoke](./api/invoke.html)
* [interpret](./api/interpret.html)
