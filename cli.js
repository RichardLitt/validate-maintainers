#!/usr/bin/env node

const meow = require('meow')
const validate = require('./')

const cli = meow(`
  Usage
    $ validate-maintainers <input>

  Options
    --local, -l   Use a local package.json instead of fetching from the registry
    --dists, -d   Print distribution tags from npm
    --version, -v Specify a version of the npm package to check

  Examples
    $ validate-maintainers orbitdb
    There are no locally-specified npm maintainers for 0.19.9.
`, {
  flags: {
    dist: {
      type: 'boolean',
      alias: 'd'
    },
    local: {
      type: 'boolean',
      alias: 'l'
    },
    version: {
      type: 'string',
      alias: 'v'
    }
  }
})

validate(cli.input[0], cli.flags)
