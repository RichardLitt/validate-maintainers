#!/usr/bin/env node

const meow = require('meow')
const validate = require('./')

const cli = meow(`
  Usage
    $ validate-maintainers <input>

  Options
    --local, -l   Use a local package.json instead of fetching from the registry
    --dists, -d   Print distribution tags from npm

  Examples
    $ validate-maintainers orbit-db
    There are no locally-specified npm maintainers for 0.19.9.

    $ validate-maintainers validate-maintainers@latest
    Version: latest
    Everybody wins!
    The npm-set maintainers match the manually-set maintainers exactly.
    The current maintainers for validate-maintainers@latest:
      - richardlitt
`, {
  flags: {
    dist: {
      type: 'boolean',
      alias: 'd'
    },
    local: {
      type: 'boolean',
      alias: 'l'
    }
  }
})

validate(cli.input[0], cli.flags)
