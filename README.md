# Validate Maintainers

> Validate your npm package maintainers to limit your bus factor

This package validates a `localMaintainers` field which you can set to match the npm-set `maintainers` field. This makes it easier to limit your bus-factor for npm packages, by making sure that you have more than one person who can publish to an npm package.

## Background

The set of people who maintain a repository on GitHub and who maintain an npm repository are not always the same. This package helps you figure out quickly if the maintainers for an npm package have also been specified locally in the `package.json` in the GitHub repository. The advantage of locally setting a field in the manifest is that it becomes part of the commit history, and that GitHub doesn't currently publicize this information in their API. Using another field instead of `authors` (when people sometimes move on) and `maintainers` (who may not have push rights) makes npm publishing rights explicit.

Ideally, this package could be added to the suite of tools that help community organizers know who had access and control of their GitHub and npm packages.


## Install

```sh
npm install --global validate-maintainers
```

For now, this is only a CLI tool.

## Usage

### Setting the field

In your `package.json`:

```json
{
  ...
  "localMaintainers": "richardlitt <richard.littauer@gmail.com>",
  ...
}
```

Or:

```json
{
  ...
  "localMaintainers": [
    "richardlitt <richard.littauer@gmail.com>",
    ...
  ],
  ...
}
```

### Running the CLI tool

```sh
Usage
  $ validate-maintainers <input>

Options
  --local, -l Compare a local package.json to the one in the registry
  --dist      Print distribution tags from npm (eg: npm info <pkg> dist-tags)
  --versions  Print versions from npm (eg: npm info <pkg> versions)

Examples
  $ validate-maintainers orbit-db
  There are no manually-specified npm maintainers for 0.19.9.

  # To set a verison, use <pkg@version>
  $ validate-maintainers validate-maintainers@latest
  Version: latest
  Everybody wins!
  The npm-set maintainers match the manually-set maintainers exactly.
  The current maintainers for validate-maintainers@latest:
    - richardlitt
```

### How to set new maintainers

Validate Maintainers will _not_ set your maintainers for your repository. You need to do this manually. To add someone as a maintainer for an npm package, take a look at `npm owner --help`. As well, to set the local maintainers, add a `localMaintainers` field in your `package.json` and add anyone who should have *publishing* rights to your repository. This is different from the `authors` and `maintainers` field in your `package.json`, which doesn't perfectly line up with actual users who have publishing rights.

## Contribute

Please do! Open an issue! Open a PR!

Please abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © 2019 Burnt Fen Creative LLC.