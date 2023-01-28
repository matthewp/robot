# Contributing

## Tests

Core tests are in `packages/core/test`. You can run then by first launching a server:

```shell
npm run --workspace=packages/core server
```

And then  loading `http://localhost:1965/test/test.html` in a browser.

To run the tests from the CLI you can run:

```shell
npm test --workspace=packages/core
```

## Submitting a PR

When you submit a PR, be sure to add a changeset, which is used to automate the release process.

```shell
npm run changeset
```

Answer the prompts which will create a file in the `.changeset/` folder. You can edit this file to write a description of the changes.

## Releases

Releases are automated with [changesets](https://github.com/changesets/changesets). Once a PR has been submitted, an action will create a new PR for the release. Submit that PR in order to release a new version.