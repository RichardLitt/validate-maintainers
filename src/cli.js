#!/usr/bin/env node

const meow = require('meow')
const validate = require('./')

const cli = meow(`
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
    --one      Ignore the error if there is only one maintainer

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
`, {
  flags: {
    dist: {
      type: 'boolean'
    },
    local: {
      type: 'boolean',
      alias: 'l'
    },
    versions: {
      type: 'boolean'
    },
    commit: {
      type: 'string',
      alias: 'c'
    },
    github: {
      type: 'string'
    }
  }
})

validate(cli.input[0], cli.flags)
