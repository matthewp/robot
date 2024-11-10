# robot3

## 1.0.1

### Patch Changes

- 1fc7737: Don't make a state transition if the state is left before the invoked promise resolves, _even_ if there's a transition with the same name.
- 0dc1c1a: ### WHAT:

  Explicitly routing the right place for the index.d.ts file

  ### WHY:

  Types fail to load in some scenarios. F.i PNPM throws the error: "There are types at '/xxxx/node_modules/robot3/index.d.ts', but this result could not be resolved when respecting package.json "exports". The 'robot3' library may need to update its package.json or typings."

  ### HOW:

  Added types path for exports in package.json

## 1.0.0

### Major Changes

- 52742ab: Call onChange callbacks for immediate states too

## 0.4.1

### Patch Changes

- fc4806e: Adding an export property to the core package.json for 'import' so that destructured imports work, in addition to the default imports handled by the 'default' property

## 0.4.0

### Minor Changes

- cce2ae6: Drop support for Node 14

  This drops support for Node 14, with it no longer being supported by the LTS in February. Robot might still work in Node 14 but is not tested in our CI.
