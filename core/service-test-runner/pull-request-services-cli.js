// Derive a list of service tests to run based on
// space-separated service names in the PR title.
//
// Output the list of services.
//
// Pull request title: [travis sonar] Support user token authentication
//
// Output:
// travis
// sonar

import servicesForTitle from './services-for-title.js'

let title

try {
  if (process.argv.length < 3) {
    throw new Error()
  }
  title = process.argv[2]
} catch (e) {
  console.error('Error processing arguments')
  process.exit(1)
}

console.error(`Title: ${title}\n`)
const services = servicesForTitle(title)
if (services.length === 0) {
  console.error('No services found. Nothing to do.')
} else {
  console.error(`Services: (${services.length} found) ${services.join(', ')}\n`)
  console.log(services.join('\n'))
}
