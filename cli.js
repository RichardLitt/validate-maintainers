#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2))
const validate = require('./')

validate(argv['_'][0])
