// Automatically detect the services changed by comparing the current commit
// to `master`. This approach of examining commits was taken because detecting
// a pull request from CircleCI is unreliable. It allows for a nicer dev
// experience because it will generally automatically detect which files have
// changed.
//
// If for any reason the automatic service detection doesn't correctly
// identify the affected services, additional services can be tagged in a commit
// message, e.g.
//
// - [Travis] Fix timeout issues
// - [Travis Sonar] Support user token authentication
// - [CRAN CPAN CTAN] Add test coverage

'use strict'

const simpleGit = require('simple-git/promise')
const { identifyServices } = require('../../services')
const servicesForTitle = require('./services-for-title')

async function taggedServices() {
  const log = await simpleGit(__dirname).log(['--first-parent', 'master..HEAD'])
  const commitMessages = log.all.map(l => l.message)
  return commitMessages.reduce(
    (accum, message) => accum.concat(servicesForTitle(message)),
    []
  )
}

async function modifiedServices() {
  const diffSummary = await simpleGit(__dirname).diffSummary([
    '--no-renames',
    'master...HEAD',
  ])
  const affectedFiles = diffSummary.files.map(f => f.file)
  return identifyServices(affectedFiles)
}

async function allAffectedServices() {
  return (await taggedServices()).concat(await modifiedServices())
}

async function main() {
  const services = await allAffectedServices()
  if (services.length === 0) {
    console.error('No services found. Nothing to do.')
  } else {
    console.error(
      `Services: (${services.length} found) ${services.join(', ')}\n`
    )
    console.log(services.join('\n'))
  }
}

if (require.main === module) {
  ;(async () => {
    try {
      await main()
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  })()
}

module.exports = {
  allAffectedServices,
}
