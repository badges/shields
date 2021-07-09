// Infer the current PR from the Travis environment, and look for bracketed,
// space-separated service names in the pull request title.
//
// Output the list of services.
//
// Pull request title: [travis sonar] Support user token authentication
//
// Output:
// travis
// sonar
//
// Example:
//
// TRAVIS=1 TRAVIS_REPO_SLUG=badges/shields TRAVIS_PULL_REQUEST=1108 npm run test:services:pr:prepare

import got from 'got'
import { inferPullRequest } from './infer-pull-request.js'
import servicesForTitle from './services-for-title.js'

async function getTitle(owner, repo, pullRequest) {
  const {
    body: { title },
  } = await got(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullRequest}`,
    {
      headers: {
        'User-Agent': 'badges/shields',
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      responseType: 'json',
    }
  )
  return title
}

async function main() {
  const { owner, repo, pullRequest, slug } = inferPullRequest()
  console.error(`PR: ${slug}`)

  const title = await getTitle(owner, repo, pullRequest)

  console.error(`Title: ${title}\n`)
  const services = servicesForTitle(title)
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
