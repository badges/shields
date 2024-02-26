import Joi from 'joi'
import { matcher } from 'matcher'
import { nonNegativeInteger } from '../validators.js'
import { latest } from '../version.js'
import { NotFound, queryParams } from '../index.js'
import { httpErrorsFor } from './github-helpers.js'

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
    httpErrors: httpErrorsFor('no releases or repo not found'),
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
  Joi.array().length(0),
)

async function fetchReleases(serviceInstance, { user, repo }) {
  const commonAttrs = {
    httpErrors: httpErrorsFor('repo not found'),
  }
  const releases = await serviceInstance._requestJson({
    url: `/repos/${user}/${repo}/releases`,
    schema: releaseInfoArraySchema,
    ...commonAttrs,
    options: { searchParams: { per_page: 100 } },
  })
  return releases
}

function getLatestRelease({ releases, sort, includePrereleases }) {
  if (sort === 'semver') {
    const latestTagName = latest(
      releases.map(release => release.tag_name),
      { pre: includePrereleases },
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

const sortEnum = ['date', 'semver']

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
  sort: Joi.string()
    .valid(...sortEnum)
    .default('date'),
  filter: Joi.string(),
}).required()

const filterDocs = `
The <code>filter</code> param can be used to apply a filter to the
project's tag or release names before selecting the latest from the list.
Two constructs are available: <code>*</code> is a wildcard matching zero
or more characters, and if the pattern starts with a <code>!</code>,
the whole pattern is negated.
`

const openApiQueryParams = queryParams(
  {
    name: 'include_prereleases',
    example: null,
    schema: { type: 'boolean' },
  },
  {
    name: 'sort',
    example: 'semver',
    schema: { type: 'string', enum: sortEnum },
  },
  { name: 'filter', example: '*beta*', description: filterDocs },
)

function applyFilter({ releases, filter, displayName }) {
  if (!filter) {
    return releases
  }
  if (displayName === 'tag') {
    const filteredTagNames = matcher(
      releases.map(release => release.tag_name),
      filter,
    )
    return releases.filter(release =>
      filteredTagNames.includes(release.tag_name),
    )
  }
  const filteredReleaseNames = matcher(
    releases.map(release => release.name),
    filter,
  )
  return releases.filter(release => filteredReleaseNames.includes(release.name))
}

// Fetch the latest release as defined by query params
async function fetchLatestRelease(
  serviceInstance,
  { user, repo },
  queryParams,
) {
  const sort = queryParams.sort
  const includePrereleases = queryParams.include_prereleases !== undefined
  const filter = queryParams.filter
  const displayName = queryParams.display_name

  if (!includePrereleases && sort === 'date' && !filter) {
    const releaseInfo = await fetchLatestGitHubRelease(serviceInstance, {
      user,
      repo,
    })
    return releaseInfo
  }

  const releases = applyFilter({
    releases: await fetchReleases(serviceInstance, { user, repo }),
    filter,
    displayName,
  })
  if (releases.length === 0) {
    const prettyMessage = filter
      ? 'no matching releases found'
      : 'no releases found'
    throw new NotFound({ prettyMessage })
  }
  const latestRelease = getLatestRelease({ releases, sort, includePrereleases })
  return latestRelease
}

export { fetchLatestRelease, queryParamSchema, openApiQueryParams }

// currently only used for tests
export const _getLatestRelease = getLatestRelease
export const _applyFilter = applyFilter
