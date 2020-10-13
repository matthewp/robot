---
layout: page.njk
title: Integrations
tags: page
permalink: integrations.html
---

# Integrations

Robot is easy to use on its own, however we also have a few integration points with popular libraries. The following integrations are available:

## Libraries

* __[preact-robot](./integrations/preact-robot.html)__: Provides the `useMachine` hook for use with [Preact](https://preactjs.com/) and `preact/hooks`.
* __[haunted-robot](./integrations/haunted-robot.html)__: Provides the `useMachine` hook for use with [Haunted](https://github.com/matthewp/haunted).
* __[react-robot](./integrations/react-robot.html)__: Provides the `useMachine` hook for use with [React](https://reactjs.org/) and [hooks](https://reactjs.org/docs/hooks-intro.html).
* __[lit-robot](./integrations/lit-robot.html)__: Provides a mixin for use with [LitElement](https://lit-element.polymer-project.org/).
* __[robot-hooks](./integrations/robot-hooks.html)__: A generic library for creating hooks for any hook-supporting view library. This is used internally by the above libraries.
* __[svelte-robot-factory](./integrations/svelte-robot-factory.html)__: A simple svelte robot integration for writable stores. Returns a [writable svelte store](https://svelte.dev/docs#writable) which implements a robot [service](https://thisrobot.life/api/interpret.html#service) on subscribe.
