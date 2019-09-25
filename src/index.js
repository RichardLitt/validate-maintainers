const _ = require('lodash')
const chalk = require('chalk')
const fs = require('graceful-fs').promises
const got = require('got')
const parse = require('parse-author')
const helpers = require('./helpers.js')
const simpleGit = require('simple-git/promise')('.')
const Octokit = require('@octokit/rest')
const octokit = new Octokit()
const base64 = require('js-base64').Base64

async function getLocalPackageFromCommit (flags) {
  const packageJson = await simpleGit.show([`${flags.commit}:package.json`])
    .catch(() => process.exit(1)) // Error logged to console by git
    .then(res => JSON.parse(res))
  const pkgString = `\`package.json\` at ${flags.commit.slice(0, 7)}`
  return [packageJson, pkgString]
}

async function getPackageFromGitHub (flags) {
  let ghOpts = {
    'owner': flags.github.split('/')[0], // Format: octokit/rest.js
    'repo': flags.github.split('/')[1], // TODO Check to validate format
    'ref': flags.commit || 'HEAD', // Should refer to main branch on GitHub. TODO test
    'path': 'package.json' // Assume base. Add path switch if someone needs this.
  }
  const packageJson = await octokit.repos.getContents(ghOpts)
    .catch(e => {
      if (e.status === 404) {
        console.log(chalk.red('That is not a GitHub repository, or we couldn\'t find that commit!'))
        process.exit(1)
      }
    })
    .then(res => JSON.parse(base64.decode(res.data.content)))

  const pkgString = `\`package.json\` at ${flags.github} on GitHub${(flags.commit) ? ' at ' + flags.commit.slice(0, 7) : ''}`

  return [packageJson, pkgString]
}

// Get a package.json from npm
async function getNpmPackage (name, flags) {
  name = 'https://registry.npmjs.org/' + name.replace('@', '/')

  // The package.json we fetch from NPM, which should have a maintainers field
  const packageJson = await got(name)
    .then(name => JSON.parse(name.body))
    .catch((e) => {
      if (e.statusCode === 405) {
        console.log(chalk.red('405: Are you sure this is the name of the npm package?'))
        process.exit(1)
      }
      if (e.statusCode === 404) {
        console.log(chalk.red('404: That doesn\'t appear to be an npm package.'))
        process.exit(1)
      }
    })

  const pkgString = `\`package.json\` on npm`

  // Return the specific version we got
  if (flags.version) {
    return [packageJson, pkgString]
  }

  // Or just return the latest one
  // We have to manually specify latest because npm strips out unnecessary fields
  return [packageJson.versions[packageJson['dist-tags'].latest], pkgString]
}

// Get the local file
async function getLocalPackage () {
  let packageJson = await fs.readFile('package.json', 'utf8')
    .catch(e => {
      if (e.code === 'ENOENT') {
        console.log(chalk.red('There is no package.json in this directory.'))
        process.exit(1)
      }
    })
  packageJson = JSON.parse(packageJson)
  return [packageJson, `local \`package.json\``]
}

async function matchMaintainers (npmPackageJson, sourcePackageJson, pkgString) {
  const npmField = JSON.stringify(_.map(npmPackageJson.maintainers, (obj) => helpers.sortKeys(obj)).sort(helpers.sortAlphabetic))
  const sourceField = JSON.stringify(_.map(helpers.convertStringToArr(sourcePackageJson.localMaintainers), (user) => helpers.sortKeys(parse(user))).sort(helpers.sortAlphabetic))

  if (!npmPackageJson.localMaintainers) {
    console.log(`❌ There is no \`localMaintainers\` field on npm for ${npmPackageJson.name}@${npmPackageJson.version || npmPackageJson['dist-tags'].latest}.

Did someone publish it?
`)
  }

  if (npmField === sourceField) {
    console.log(`✅ \`maintainers\` on npm ${chalk.green('matches')} \`localMaintainers\` in the ${pkgString} exactly.
The current maintainer${(npmPackageJson.maintainers.length === 1) ? '' : 's'} for ${npmPackageJson.name}@${npmPackageJson.version || npmPackageJson['dist-tags'].latest} ${(npmPackageJson.maintainers.length === 1) ? 'is' : 'are'}:
    - ${_.map(npmPackageJson.maintainers, (user) => user.name).join('\n    - ')}`)
  } else {
    console.log(`❌ There are \`localMaintainers\` in the ${pkgString}, but they don't match the ones on npm.`)
    console.log('npm field: ', chalk.red(`${helpers.stringifyUsers(npmPackageJson.maintainers)}`))
    console.log('local field:', chalk.red(`${helpers.stringifyUsers(sourcePackageJson.localMaintainers)}`))
  }
}

// The meat of this program
async function validateMaintainers (name, flags) {
  let packageJson, npmPackageJson, pkgString
  flags.version = flags.version || (name && name.indexOf('@')) ? name.split('@')[1] : false

  // Get the Package.Json to check
  // If there is a commit flag, get that in the current git directory
  if (flags.commit && !flags.github) {
    [packageJson, pkgString] = await getLocalPackageFromCommit(flags)

  // If a package is not specified as an argument, check for a local file
  } else if (flags.local || !(name || flags.github)) {
    [packageJson, pkgString] = await getLocalPackage()

  // Error case
  } else if (flags.github && flags.local && !flags.match) {
    console.log(chalk.red('You cannot specify both GitHub and a local file without using --match'))
    process.exit(1)

  // If there is a GitHub flag, check against that (flags.commit can be there, too)
  } else if (flags.github) {
    [packageJson, pkgString] = await getPackageFromGitHub(flags)

  // Else, fetch from npm
  } else {
    [packageJson, pkgString] = await getNpmPackage(name, flags)
    flags.match = 'identical'
    // Set this so we can get specific information if needed
    npmPackageJson = packageJson
  }

  if (!packageJson.localMaintainers) {
    console.log(chalk.red(`❌ There are no manually-specified npm maintainers for the ${pkgString}.`))
    process.exit(1)
  } else {
    console.log(`✅ The ${chalk.blue(pkgString)} has a ${chalk.green('valid')} localMaintainers field, with these maintainers:
    - ${_.map(_.map(helpers.convertStringToArr(packageJson.localMaintainers), (user) => helpers.sortKeys(parse(user))).sort(helpers.sortAlphabetic), (user) => `${user.name} <${user.email}>`).join('\n    - ')}`)
  }

  // Get the Npm package, if needed
  if (!npmPackageJson && (flags.version)) {
    [npmPackageJson] = await getNpmPackage(packageJson.name, flags)
  }

  // Show me current releases, and whatever version I've specified
  if (flags.version) {
    console.log(`Version: ${flags.version}`)
  }

  if (flags.match && typeof flags.match !== 'string') {
    if (!npmPackageJson) {
      [npmPackageJson] = await getNpmPackage(packageJson.name, flags)
    }

    matchMaintainers(npmPackageJson, packageJson, pkgString)
  }
}

module.exports = validateMaintainers
