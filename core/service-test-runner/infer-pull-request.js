/**
 * @module
 */

import { URL, format as urlFormat } from 'url'

function formatSlug(owner, repo, pullRequest) {
  return `${owner}/${repo}#${pullRequest}`
}

function parseGithubPullRequestUrl(url, options = {}) {
  const { verifyBaseUrl } = options

  const parsed = new URL(url)
  const components = parsed.pathname.substr(1).split('/')
  if (components[2] !== 'pull' || components.length !== 4) {
    throw Error(`Invalid GitHub pull request URL: ${url}`)
  }
  const [owner, repo, , pullRequest] = components

  parsed.pathname = ''
  const baseUrl = urlFormat(parsed, {
    auth: false,
    fragment: false,
    search: false,
  }).replace(/\/$/, '')

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

/**
 * When called inside a CI build, infer the details
 * of a pull request from the environment variables.
 *
 * @param {object} [env=process.env] Environment variables
 * @returns {module:core/service-test-runner/infer-pull-request~PullRequest}
 *    Pull Request
 */
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

/**
 * Pull Request
 *
 * @typedef PullRequest
 * @property {string} pr.baseUrl (returned for travis CI only)
 * @property {string} owner
 * @property {string} repo
 * @property {string} pullRequest PR/issue number
 * @property {string} slug owner/repo/#pullRequest
 */

export { parseGithubPullRequestUrl, parseGithubRepoSlug, inferPullRequest }
