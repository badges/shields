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

'use strict';

const difference = require('lodash.difference');
const fetch = require('node-fetch');
const { inferPullRequest } = require('./infer-pull-request');

async function getTitle (owner, repo, pullRequest) {
  let uri = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullRequest}`;
  if (process.env.GITHUB_TOKEN) {
    uri += `?access_token=${process.env.GITHUB_TOKEN}`;
  }
  const options = { headers: { 'User-Agent': 'badges/shields' } };
  const res = await fetch(uri, options);
  if (! res.ok) {
    throw Error(`${res.status} ${res.statusText}`);
  }

  const { title } = await res.json();
  return title;
}

// [Travis] Fix timeout issues => ['travis']
// [Travis Sonar] Support user token authentication -> ['travis', 'sonar']
// [CRAN CPAN CTAN] Add test coverage => ['cran', 'cpan', 'ctan']
function servicesForTitle (title) {
  const matches = title.match(/\[(.+)\]/);
  if (matches === null) {
    return [];
  }

  const services = matches[1].toLowerCase().split(' ');
  const blacklist = ['wip', 'rfc'];
  return difference(services, blacklist);
}

async function main() {
  const { owner, repo, pullRequest, slug } = inferPullRequest();
  console.error(`PR: ${slug}`);

  const title = await getTitle(owner, repo, pullRequest);

  console.error(`Title: ${title}\n`);
  const services = servicesForTitle(title);
  if (services.length === 0) {
    console.error('No services found. Nothing to do.');
  } else {
    console.error(`Services: (${services.length} found) ${services.join(', ')}\n`);
    console.log(services.join('\n'));
  }
}

(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
