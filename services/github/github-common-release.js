import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { latest } from '../version.js'
import { NotFound } from '../index.js'
import { errorMessagesFor } from './github-helpers.js'

const releaseInfoSchema = Joi.object({
  assets: Joi.array()
    .items({
      name: Joi.string().required(),
      download_count: nonNegativeInteger,
    })
    .required(),
  tag_name: Joi.string().required(),
  name: Joi.string().allow(null).allow(''),
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
    const latestTagName = latest(
      releases.map(release => release.tag_name),
      { pre: includePrereleases }
    )
    return releases.find(({ tag_name: tagName }) => tagName === latestTagName)
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
  sort: Joi.string().valid('date', 'semver').default('date'),
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

export { fetchLatestRelease, queryParamSchema }
export const _getLatestRelease = getLatestRelease // currently only used for tests
