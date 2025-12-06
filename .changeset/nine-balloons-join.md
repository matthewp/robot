---
"lit-robot": major
---

Change the signature of the `Robot` mixin to accomodate TypeScript's type system, remove the machine field from the class and add an `onChange` callback that is called in `interpret`;

To migrate, convert the following code:
```js
class Foo extends Robot(Bar) {
    static machine = /* machine */;
    // ...
}
```
to
```js
class Foo extends Robot(Bar, /* machine */) {
    // ...
}
```
