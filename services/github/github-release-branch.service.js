import Joi from 'joi'
import { NotFound, pathParam, queryParam } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const releaseSchema = Joi.object({
  tag_name: Joi.string().required(),
  target_commitish: Joi.string().required(),
  prerelease: Joi.boolean().required(),
  name: Joi.string().allow(null).allow(''),
}).required()

const releaseArraySchema = Joi.alternatives().try(
  Joi.array().items(releaseSchema),
  Joi.array().length(0),
)

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
}).required()

const branchDescription = `
Returns the latest release associated with the specified branch.
Releases are matched using the \`target_commitish\` field from the GitHub API.
`

export default class GithubReleaseBranch extends GithubAuthV3Service {
  static category = 'version'

  static route = {
    base: 'github/v/release',
    pattern: ':user/:repo/:branch',
    queryParamSchema,
  }

  static openApi = {
    '/github/v/release/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub Release (by branch)',
        description: `${documentation}\n${branchDescription}`,
        parameters: [
          pathParam({ name: 'user', example: 'laravel' }),
          pathParam({ name: 'repo', example: 'framework' }),
          pathParam({ name: 'branch', example: '13.x' }),
          queryParam({
            name: 'include_prereleases',
            example: null,
            schema: { type: 'boolean' },
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'latest-release' }

  findReleaseOnPage({ releases, branch, includePrereleases }) {
    for (const release of releases) {
      if (release.target_commitish === branch) {
        if (!includePrereleases && release.prerelease) {
          continue
        }
        return release
      }
    }
    return undefined
  }

  static render({ version, isPrerelease, branch }) {
    return renderVersionBadge({
      version,
      isPrerelease,
      defaultLabel: GithubReleaseBranch.defaultBadgeData.label,
      tag: branch,
    })
  }
  transform({ release, branch }) {
    const { tag_name: version, prerelease: isPrerelease } = release
    return { version, isPrerelease, branch }
  }

  async fetchPage({ user, repo, page }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/releases`,
      schema: releaseArraySchema,
      httpErrors: httpErrorsFor('repo not found'),
      options: { searchParams: { per_page: 100, page } },
    })
  }

  async fetchLatestReleaseByBranch({ user, repo, branch, includePrereleases }) {
    let page = 1
    while (true) {
      const releases = await this.fetchPage({ user, repo, page })
      if (releases.length === 0) {
        const prettyMessage =
          page === 1 ? 'no releases found' : 'no release found for branch'
        throw new NotFound({ prettyMessage })
      }
      const release = this.findReleaseOnPage({
        releases,
        branch,
        includePrereleases,
      })
      if (release) {
        return release
      }
      page++
    }
  }

  async handle({ user, repo, branch }, queryParams) {
    const includePrereleases = queryParams.include_prereleases !== undefined
    const release = await this.fetchLatestReleaseByBranch({
      user,
      repo,
      branch,
      includePrereleases,
    })
    const result = this.transform({ release, branch })
    return this.constructor.render(result)
  }
}
