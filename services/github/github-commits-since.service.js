import Joi from 'joi'
import { pathParam } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import {
  fetchLatestRelease,
  queryParamSchema,
  openApiQueryParams,
} from './github-common-release.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({ ahead_by: nonNegativeInteger }).required()

const latestDocs = `
The <code>include_prereleases</code>, <code>sort</code> and <code>filter</code> params can be used to configure how we determine the latest version.
`

export default class GithubCommitsSince extends GithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github/commits-since',
    pattern: ':user/:repo/:version/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/github/commits-since/{user}/{repo}/{version}': {
      get: {
        summary: 'GitHub commits since tagged version',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'SubtitleEdit' }),
          pathParam({ name: 'repo', example: 'subtitleedit' }),
          pathParam({
            name: 'version',
            example: '3.4.7',
          }),
        ],
      },
    },
    '/github/commits-since/{user}/{repo}/{version}/{branch}': {
      get: {
        summary: 'GitHub commits since tagged version (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'SubtitleEdit' }),
          pathParam({ name: 'repo', example: 'subtitleedit' }),
          pathParam({
            name: 'version',
            example: '3.4.7',
          }),
          pathParam({ name: 'branch', example: 'main' }),
        ],
      },
    },
    '/github/commits-since/{user}/{repo}/latest': {
      get: {
        summary: 'GitHub commits since latest release',
        description: documentation + latestDocs,
        parameters: [
          pathParam({ name: 'user', example: 'SubtitleEdit' }),
          pathParam({ name: 'repo', example: 'subtitleedit' }),
          ...openApiQueryParams,
        ],
      },
    },
    '/github/commits-since/{user}/{repo}/latest/{branch}': {
      get: {
        summary: 'GitHub commits since latest release (branch)',
        description: documentation + latestDocs,
        parameters: [
          pathParam({ name: 'user', example: 'SubtitleEdit' }),
          pathParam({ name: 'repo', example: 'subtitleedit' }),
          pathParam({ name: 'branch', example: 'main' }),
          ...openApiQueryParams,
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'github' }

  static render({ version, commitCount }) {
    return {
      label: `commits since ${version}`,
      message: metric(commitCount),
      color: 'blue',
    }
  }

  async handle({ user, repo, version, branch }, queryParams) {
    if (version === 'latest') {
      ;({ tag_name: version } = await fetchLatestRelease(
        this,
        {
          user,
          repo,
        },
        queryParams,
      ))
    }

    const notFoundMessage = branch
      ? 'repo, branch or version not found'
      : 'repo or version not found'
    const { ahead_by: commitCount } = await this._requestJson({
      schema,
      url: `/repos/${user}/${repo}/compare/${version}...${branch || 'HEAD'}`,
      httpErrors: httpErrorsFor(notFoundMessage),
    })

    return this.constructor.render({ version, commitCount })
  }
}
