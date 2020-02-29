'use strict'

const Joi = require('@hapi/joi')
const { latest } = require('../version')
const { errorMessagesFor } = require('./github-helpers')
const { NotFound } = require('..')

const releaseInfoSchema = Joi.object({
  tag_name: Joi.string().required(),
  prerelease: Joi.boolean().required(),
}).required()

// Fetch the 'latest' release as defined by the GitHub API
async function fetchLatestGitHubRelease(serviceInstance, { user, repo }) {
  const commonAttrs = {
    errorMessages: errorMessagesFor('no releases or repo not found'),
  }
  const releaseInfo = await serviceInstance._requestJson({
    schema: releaseInfoSchema,
    url: `/repos/${user}/${repo}/releases/latest`,
    ...commonAttrs,
  })
  return releaseInfo
}

const releaseInfoArraySchema = Joi.alternatives().try(
  Joi.array().items(releaseInfoSchema),
  Joi.array().length(0)
)

async function fetchReleases(serviceInstance, { user, repo }) {
  const commonAttrs = {
    errorMessages: errorMessagesFor('repo not found'),
  }
  const releases = await serviceInstance._requestJson({
    url: `/repos/${user}/${repo}/releases`,
    schema: releaseInfoArraySchema,
    ...commonAttrs,
  })
  return releases
}

function getLatestRelease({ releases, sort, includePrereleases }) {
  if (sort === 'semver') {
    const latestRelease = latest(
      releases.map(release => release.tag_name),
      {
        pre: includePrereleases,
      }
    )
    const kvpairs = Object.assign(
      ...releases.map(release => ({ [release.tag_name]: release.prerelease }))
    )
    return { tag_name: latestRelease, prerelease: kvpairs[latestRelease] }
  }

  if (!includePrereleases) {
    const stableReleases = releases.filter(release => !release.prerelease)
    if (stableReleases.length > 0) {
      return stableReleases[0]
    }
  }

  return releases[0]
}

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
  sort: Joi.string()
    .valid('date', 'semver')
    .default('date'),
}).required()

// Fetch the latest release as defined by query params
async function fetchLatestRelease(
  serviceInstance,
  { user, repo },
  queryParams
) {
  const sort = queryParams.sort
  const includePrereleases = queryParams.include_prereleases !== undefined

  if (!includePrereleases && sort === 'date') {
    const releaseInfo = await fetchLatestGitHubRelease(serviceInstance, {
      user,
      repo,
    })
    return releaseInfo
  }

  const releases = await fetchReleases(serviceInstance, { user, repo })
  if (releases.length === 0) {
    throw new NotFound({ prettyMessage: 'no releases' })
  }
  const latestRelease = getLatestRelease({ releases, sort, includePrereleases })
  return latestRelease
}

module.exports = {
  fetchLatestRelease,
  queryParamSchema,
  _getLatestRelease: getLatestRelease, // currently only used for tests
}
