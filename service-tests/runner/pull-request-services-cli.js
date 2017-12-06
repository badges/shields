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
// TRAVIS_REPO_SLUG=badges/shields TRAVIS_PULL_REQUEST=1108 npm run test:services:pr:prepare

'use strict';

const difference = require('lodash.difference');
const fetch = require('node-fetch');

function inferPullRequest() {
  if (process.env.TRAVIS) {
    return {
      repoSlug: process.env.TRAVIS_REPO_SLUG,
      pullRequest: process.env.TRAVIS_PULL_REQUEST,
    };
  } else if (process.env.CIRCLECI) {
    const prUrl = process.env.CI_PULL_REQUEST || '';
    return {
      repoSlug: prUrl.split('/').slice(-4, -2).join('/'),
      pullRequest: prUrl.split('/').slice(-1)[0],
    };
  } else {
    return {};
  }
}

function getTitle (repoSlug, pullRequest) {
  const uri = `https://img.shields.io/github/pulls/detail/title/${repoSlug}/${pullRequest}.json`;
  const options = { headers: { 'User-Agent': 'badges/shields' }};
  return fetch(uri, options)
    .then(res => {
      if (! res.ok) {
        throw Error(`${res.status} ${res.statusText}`);
      }

      return res.json();
    })
    .then(json => json.value);
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
  const blacklist = ['wip'];
  return difference(services, blacklist);
}

const { repoSlug, pullRequest } = inferPullRequest();
if (repoSlug === undefined || pullRequest === undefined) {
  console.error('Unable to infer pull request from the environment.');
  process.exit(-1);
}
console.error(`PR: ${repoSlug}#${pullRequest}`);

getTitle(repoSlug, pullRequest)
  .then(title => {
    console.error(`Title: ${title}`);
    const services = servicesForTitle(title);
    if (services.length === 0) {
      console.error('No services found. Nothing to do.');
    } else {
      console.error(`Services: (${services.length} found) ${services.join(', ')}\n`);
      console.log(services.join('\n'));
    }
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
