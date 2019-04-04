# Validate Maintainers

> Validate your npm package maintainers to limit your bus factor

This package validates a `localMaintainers` field which you can set to match the npm-set `maintainers` field. This makes it easier to limit your bus-factor for npm packages, by making sure that you have more than one person who can publish to an npm package.

## Background

TODO

## Install

```sh
npm install --global validate-maintainers
```

For now, this is only a CLI tool.

## Usage

```sh
$ validate-maintainers <package>
Dist tags: {
  "latest": "1.0.0"
}
There are no locally-specified npm maintainers for 1.0.0.
```

### How to set new maintainers

Validate Maintainers will _not_ set your maintainers for your repository. You need to do this manually. To add someone as a maintainer for an npm package, take a look at `npm owner --help`. As well, to set the local maintainers, add a `localMaintainers` field in your package.json and add anyone who should have *publishing* rights to your repository. This is different from the `authors` and `maintainers` field in your `package.json`, which doesn't perfectly line up with actual users who have publishing rights.

## Contribute

Please do! Open an issue! Open a PR!

Please abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © 2019 Burnt Fen Creative LLC.