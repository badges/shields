'use strict'

const { parse: urlParse, format: urlFormat } = require('url')

function formatSlug(owner, repo, pullRequest) {
  return `${owner}/${repo}#${pullRequest}`
}

function parseGithubPullRequestUrl(url, options = {}) {
  const { verifyBaseUrl } = options

  const parsed = urlParse(url)
  const components = parsed.path.substr(1).split('/')
  if (components[2] !== 'pull' || components.length !== 4) {
    throw Error(`Invalid GitHub pull request URL: ${url}`)
  }
  const [owner, repo, , pullRequest] = components

  delete parsed.pathname
  const baseUrl = urlFormat(parsed, {
    auth: false,
    fragment: false,
    search: false,
  })

  if (verifyBaseUrl && baseUrl !== verifyBaseUrl) {
    throw Error(`Expected base URL to be ${verifyBaseUrl} but got ${baseUrl}`)
  }

  return {
    baseUrl,
    owner,
    repo,
    pullRequest: +pullRequest,
    slug: formatSlug(owner, repo, pullRequest),
  }
}

function parseGithubRepoSlug(slug) {
  const components = slug.split('/')
  if (components.length !== 2) {
    throw Error(`Invalid GitHub repo slug: ${slug}`)
  }
  const [owner, repo] = components
  return { owner, repo }
}

function _inferPullRequestFromTravisEnv(env) {
  const { owner, repo } = parseGithubRepoSlug(env.TRAVIS_REPO_SLUG)
  const pullRequest = +env.TRAVIS_PULL_REQUEST
  return {
    owner,
    repo,
    pullRequest,
    slug: formatSlug(owner, repo, pullRequest),
  }
}

function _inferPullRequestFromCircleEnv(env) {
  return parseGithubPullRequestUrl(env.CI_PULL_REQUEST)
}

function inferPullRequest(env = process.env) {
  if (env.TRAVIS) {
    return _inferPullRequestFromTravisEnv(env)
  } else if (env.CIRCLECI) {
    return _inferPullRequestFromCircleEnv(env)
  } else if (env.CI) {
    throw Error(
      'Unsupported CI system. Unable to obtain pull request information from the environment.'
    )
  } else {
    throw Error(
      'Unable to obtain pull request information from the environment. Is this running in CI?'
    )
  }
}

module.exports = {
  parseGithubPullRequestUrl,
  parseGithubRepoSlug,
  inferPullRequest,
}
