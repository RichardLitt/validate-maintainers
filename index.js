const _ = require('lodash')
const got = require('got')
const parse = require('parse-author')

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

// The meat of this program
async function validateMaintainers (npm) {
  if (!npm) {
    console.log('You need to specify an npm package.')
    process.exit(1)
  }
  // TODO Allow version to be set in a flag, as well
  const version = npm.indexOf('@') ? npm.split('@')[1] : false
  npm = 'https://registry.npmjs.org/' + npm.replace('@', '/')
  const packageJson = await got(npm)
    .then(npm => JSON.parse(npm.body))
    .catch((e) => {
      if (e.statusCode === 404) {
        console.log('404: That doesn\'t appear to be an npm package.')
        process.exit(1)
      }
    })
  // Show me current releases, and whatever version I've specified
  if (version) {
    console.log(`Version: ${version}`)
  } else {
    console.log('Dist tags: ' + JSON.stringify(packageJson['dist-tags'], null, 2))
  }
  if (!packageJson.localMaintainer) {
    console.log(`There are no locally-specified npm maintainers for ${version || packageJson['dist-tags'].latest}.`)
    process.exit(1)
  }
  const npmField = JSON.stringify(_.map(packageJson.maintainers, (obj) => sortKeys(obj)).sort(sortAlphabetic))
  const localField = JSON.stringify(_.map(packageJson.localMaintainers, (user) => sortKeys(parse(user))).sort(sortAlphabetic))

  if (npmField === localField) {
    console.log(`Everybody wins! The npm maintainers match the local maintainers exactly.
The current maintainers are: ${_.map(packageJson.maintainers, (user) => user.name).join(', ')}`)
  } else {
    console.log(`There are locally-specified maintainers, but they don't match the ones on NPM.
npm field: ${npmField}
local field: ${localField}`)
  }
}

module.exports = validateMaintainers
