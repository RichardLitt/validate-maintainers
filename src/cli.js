#!/usr/bin/env node

const meow = require('meow')
const validate = require('./')

const cli = meow(`
  Usage
    $ validate-maintainers <input>

  Options
    --local, -l Compare a local package.json to the one in the registry
    --dist      Print distribution tags from npm (eg: npm info <pkg> dist-tags)
    --versions  Print versions from npm (eg: npm info <pkg> versions)
    --commit    Compare against a package.json from a particular (local) commit

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
      type: 'string'
    }
  }
})

validate(cli.input[0], cli.flags)
