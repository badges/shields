import Joi from 'joi'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const MAXIMUM_SEARCHING_PAGE_NUMBER = 5

const schema = Joi.array().items(
  Joi.object({
    target_commitish: Joi.string(),
    tag_name: Joi.string(),
  }),
)

export default class GithubLatestBranchRelease extends GithubAuthV3Service {
  static category = 'version'
  static route = {
    base: 'github/v/latest-branch-release',
    pattern: ':user/:repo/:branch',
  }

  static examples = [
    {
      title: 'GitHub latest branch release',
      namedParams: { user: 'laravel', repo: 'framework', branch: '10.x' },
      staticPreview: Object.assign(this.render({ releases: [] }), {
        label: 'latest-release@10.x',
        message: 'v10.28.0',
        style: 'social',
      }),
      queryParams: {},
      documentation,
    },
  ]

  static defaultBadgeData = { namedLogo: 'github' }

  static render({ branch, latestBranchTag }) {
    return {
      label: `latest-release@${branch}`,
      message: latestBranchTag || '',
      color: 'blue',
    }
  }

  async handle({ user, repo, branch }) {
    let shouldRetry = true
    let currentPage = 0
    let latestBranchTag

    while (shouldRetry && currentPage < MAXIMUM_SEARCHING_PAGE_NUMBER) {
      currentPage++
      const releases = await this._requestJson({
        url: `/repos/${user}/${repo}/releases?per_page=100&page=${currentPage}`,
        schema,
        httpErrors: httpErrorsFor('user not found'),
      })

      latestBranchTag = releases.filter(
        release => release.target_commitish === branch,
      )[0]?.tag_name

      if (latestBranchTag) {
        shouldRetry = false
      }
    }

    return this.constructor.render({ branch, latestBranchTag })
  }
}
