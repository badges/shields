// Derive a list of service test to run based on files modified in a PR
// plus any space-separated service names in the PR title.
//
// Output the list of services.
//
// Pull request title: [travis sonar] Support user token authentication
//
// Output:
// travis
// sonar

'use strict'

const fs = require('fs')
const { join } = require('path')
const util = require('util')
const github = require('@actions/github')
const servicesForTitle = require('./services-for-title')

const readFile = util.promisify(fs.readFile)

async function getServicesFromDiff() {
  const buffer = await readFile(join(process.env.HOME, 'files.json'))
  const text = buffer.toString()
  const files = JSON.parse(text)
  return files
    .map(file => {
      const match = file.match(/^services\/(.+)\/.+\.(service|tester).js$/)
      return match ? match[1].replace('-', '').toLowerCase() : undefined
    })
    .filter(Boolean)
}

function getServicesFromTitle() {
  const title = github.context.payload.pull_request.title
  console.error(`Title: ${title}\n`)
  return servicesForTitle(title)
}

async function main() {
  const titleServices = getServicesFromTitle()
  const diffServices = await getServicesFromDiff()
  const services = [...new Set([...titleServices, ...diffServices])]

  if (services.length === 0) {
    console.error('No services found. Nothing to do.')
  } else {
    console.error(
      `Services: (${services.length} found) ${services.join(', ')}\n`
    )
    console.log(services.join('\n'))
  }
}

;(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
