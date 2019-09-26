# Validate Maintainers

> Validate your npm package maintainers to limit your bus factor

This package validates a `localMaintainers` field which you can set to match the npm-set `maintainers` field. This makes it easier to limit your bus-factor for npm packages, by making sure that you have more than one person who can publish to an npm package.

## Background

The set of people who maintain a repository on GitHub and who maintain an npm repository are not always the same. This package helps you figure out quickly if the maintainers for an npm package have been specified in the `package.json` in a new field, `localMaintainers`. The advantage of setting this field in the manifest is that:

  - Maintenance rights become part of the commit history
  - Npm doesn't currently publicize this information in their API
  - It is easy to check who has or should have publishing rights

Using another field instead of `authors` (when people sometimes move on) and `maintainers` (who may not have push rights) makes npm publishing rights explicit.

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

Below, you'll find the general help. However, you generally want to do two things:

- *Validate* the `package.json` by running: `> validate-maintainers --local`
- *Match* it with npm's published version: `> validate-maintainers --match`

```sh
Usage
  $ validate-maintainers <input>

Options
  --local, -l   Compare a local package.json to the one in the registry
  --commit, -c  Compare against a package.json from a particular (local)
              commit
  --github    Compare against a file on GitHub. Format: user/repo
              Can be used with --commit to point to a specific commit.
  --match     Match whatever version you are getting against the published
              npm version
  --ci        Only print and exit with 1 if error
  --one       Ignore the error if there is only one maintainer

Examples
  $ validate-maintainers validate-maintainers
  ✅ The \`package.json\` on npm has a valid localMaintainers field, with these maintainers:
  - richardlitt <richard.littauer@gmail.com>

  $ validate-maintainers --commit cf5e43407cb0c682e99b01edeaaf6c43cbd27239
  ❌ There are no manually-specified npm maintainers for validate-maintainers@1.0.0.

  # To check an npm version, use <pkg@version>
  $ validate-maintainers validate-maintainers@latest
  ✅ The \`package.json\` on npm has a valid localMaintainers field, with these maintainers:
      - richardlitt <richard.littauer@gmail.com>
  Version: latest

  $ validate-maintainers --commit=HEAD~5
  ✅ The \`package.json\` at HEAD~5 has a valid localMaintainers field, with these maintainers:
  - richardlitt <richard.littauer@gmail.com>

  $ validate-maintainers --github RichardLitt/validate-maintainers
  ✅ The \`package.json\` at RichardLitt/validate-maintainers on GitHub has a valid localMaintainers field, with these maintainers:
  - richardlitt <richard.littauer@gmail.com>

  $ validate-maintainers --github orbitdb/benchmark-runner --match
  ✅ The \`package.json\` at orbitdb/benchmark-runner on GitHub has a valid localMaintainers field, with these maintainers:
      - hajamark <mark@haja.io>
  ❌ There is no \`localMaintainers\` field on npm for orbit-db-benchmark-runner@1.0.0.

  Did someone publish it?

  ✅ \`maintainers\` on npm matches \`localMaintainers\` in the \`package.json\` at orbitdb/benchmark-runner on GitHub exactly.
  The current maintainer for orbit-db-benchmark-runner@1.0.0 is:
      - hajamark
```

### Testing it on CI

To test it on CI, use the `--ci` flag:

```sh
validate-maintainers --github=$githubRepo --commit=$localBranch --match --ci
```

This *should* only throw an error and break if the commit doesn't match npm, in which case you should manually set new maintainers on NPM.

### How to set new maintainers

Validate Maintainers will _not_ set your maintainers for your repository. You need to do this manually. To add someone as a maintainer for an npm package, take a look at `npm owner --help`. As well, to set the local maintainers, add a `localMaintainers` field in your `package.json` and add anyone who should have *publishing* rights to your repository. This is different from the `authors` and `maintainers` field in your `package.json`, which doesn't perfectly line up with actual users who have publishing rights.

## Contribute

Please do! Open an issue! Open a PR!

Please abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © 2019 Burnt Fen Creative LLC.