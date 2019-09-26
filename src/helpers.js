const _ = require('lodash')
const chalk = require('chalk')

// Helper Methods
function sortKeys (obj) {
  const ordered = {}
  Object.keys(obj).sort().forEach(function (key) {
    ordered[key] = obj[key]
  })
  return ordered
}

function sortAlphabetic (a, b) {
  var nameA = a.name.toLowerCase(); var nameB = b.name.toLowerCase()
  if (nameA < nameB) { return -1 }// sort string ascending
  if (nameA > nameB) { return 1 }
  return 0 // default return value (no sorting)
}

function stringifyUsers (arr) {
  return _.map(arr, (user) => user.name).join(', ')
}

// Allow single author fields to be a string and not an array
function convertStringToArr (str) {
  if (str.indexOf(',') !== -1) {
    console.log(chalk.red(`There almost certainly shouldn't be a comma in an npm string field.`))
    process.exit(1)
  }
  return (typeof str === 'string') ? [str] : str
}

module.exports = {
  sortKeys,
  sortAlphabetic,
  stringifyUsers,
  convertStringToArr
}
