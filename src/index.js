const _ = require('lodash')
const chalk = require('chalk')
const fs = require('graceful-fs').promises
const got = require('got')
const parse = require('parse-author')
const helpers = require('./helpers.js')

// The meat of this program
async function validateMaintainers (npm, flags) {
  if (!npm) {
    let localPackageJson = await fs.readFile('package.json', 'utf8')
      .catch(e => {
        if (e.code === 'ENOENT') {
          console.log(chalk.red('You need to specify an npm package.'))
          process.exit(1)
        }
      })
    localPackageJson = JSON.parse(localPackageJson)
    if (localPackageJson.name) {
      npm = localPackageJson.name
      console.log(`Checking maintainers for`, chalk.blue(`${npm}.`))
    }
  }
  let version = npm.indexOf('@') ? npm.split('@')[1] : false
  npm = 'https://registry.npmjs.org/' + npm.replace('@', '/')
  // The package.json we fetch from NPM, which should have a maintainers field
  const npmPackageJson = await got(npm)
    .then(npm => JSON.parse(npm.body))
    .catch((e) => {
      if (e.statusCode === 404) {
        console.log(chalk.red('404: That doesn\'t appear to be an npm package.'))
        process.exit(1)
      }
    })

  // The package.json we've manually edited, either locally or fetched from npm
  // which we compare against
  let latest, manualPackageJson
  if (!version) {
    // We have to manually specify latest because npm strips out unnecessary fields
    latest = npmPackageJson['dist-tags'].latest
    manualPackageJson = npmPackageJson.versions[latest]
  } else {
    manualPackageJson = npmPackageJson
  }

  // If a local packageJson is specified, read it locally, and reset the manual var
  if (flags.local) {
    let localPackageJson = await fs.readFile('package.json', 'utf8')
    manualPackageJson = JSON.parse(localPackageJson)
  }

  // Show me current releases, and whatever version I've specified
  if (version) {
    console.log(`Version: ${version}`)
  }

  if (flags.versions) {
    console.log('Versions: ' + chalk.blue(JSON.stringify(Object.keys(npmPackageJson['versions']), null, 2)))
  }

  if (flags.dist) {
    console.log('Dist tags: ' + chalk.blue(JSON.stringify(npmPackageJson['dist-tags'], null, 2)))
  }

  if (!manualPackageJson.localMaintainers) {
    console.log(chalk.red(`There are no manually-specified npm maintainers for ${npmPackageJson.name}@${version || npmPackageJson['dist-tags'].latest}.`))
    process.exit(1)
  }
  const npmField = JSON.stringify(_.map(npmPackageJson.maintainers, (obj) => helpers.sortKeys(obj)).sort(helpers.sortAlphabetic))
  const localField = JSON.stringify(_.map(helpers.convertStringToArr(manualPackageJson.localMaintainers), (user) => helpers.sortKeys(parse(user))).sort(helpers.sortAlphabetic))

  if (npmField === localField) {
    console.log(chalk.green(`Everybody wins!
The npm-set maintainers match the manually-set maintainers exactly.
The current maintainers for ${npmPackageJson.name}@${version || npmPackageJson['dist-tags'].latest}:
  - ${_.map(npmPackageJson.maintainers, (user) => user.name).join('\n   - ')}`))
  } else {
    console.log(`There are manually-specified maintainers, but they don't match the ones on NPM.`)
    console.log('npm field: ', chalk.red(`${helpers.stringifyUsers(npmPackageJson.maintainers)}`))
    console.log('local field:', chalk.red(`${helpers.stringifyUsers(manualPackageJson.localMaintainers)}`))
  }
}

module.exports = validateMaintainers
