# lit-robot

## 3.0.0

### Major Changes

- 7edc985: Change the signature of the `Robot` mixin to accomodate TypeScript's type system, remove the machine field from the class and add an `onChange` callback that is called in `interpret`;

  To migrate, convert the following code:

  ```js
  class Foo extends Robot(Bar) {
      static machine = /* machine */;
      // ...
  }
  ```

  to

  ```js
  class Foo extends Robot(Bar /* machine */) {
    // ...
  }
  ```

### Patch Changes

- 7edc985: Add Typescript support in the form of types

## 1.0.0

### Patch Changes

- Updated dependencies [52742ab]
  - robot3@1.0.0

## 0.3.0

### Minor Changes

- 716c45a: Upgrade to the latest version of Robot
- 716c45a: Upgrade to depend on lit

### Patch Changes

- Updated dependencies [cce2ae6]
  - robot3@0.4.0
