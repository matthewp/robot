# robot3

## 1.0.2

### Patch Changes

- 9fbdbcb: Set the most deeply nested current service to current
- 0409089: Documentation for advanced use of 'invoke()'

## 1.0.1

### Patch Changes

- cc17481: Add debug to package exports

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
