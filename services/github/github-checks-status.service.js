import Joi from 'joi'
import { pathParam } from '../index.js'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import {
  documentation as commonDocumentation,
  httpErrorsFor,
} from './github-helpers.js'

const description = `
Displays the status of a tag, commit, or branch, as reported by the Commit Status API.
Nowadays, GitHub Actions and many third party integrations report state via the
Checks API. If this badge does not show expected values, please try out our
corresponding Check Runs badge instead. You can read more about status checks in
the [GitHub documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks).

${commonDocumentation}
`

const schema = Joi.object({
  state: isBuildStatus,
}).required()

export default class GithubChecksStatus extends GithubAuthV3Service {
  static category = 'build'
  static route = {
    base: 'github/checks-status',
    pattern: ':user/:repo/:ref',
  }

  static openApi = {
    '/github/checks-status/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub branch status',
        description,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          pathParam({ name: 'branch', example: 'master' }),
        ],
      },
    },
    '/github/checks-status/{user}/{repo}/{commit}': {
      get: {
        summary: 'GitHub commit status',
        description,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          pathParam({
            name: 'commit',
            example: '91b108d4b7359b2f8794a4614c11cb1157dc9fff',
          }),
        ],
      },
    },
    '/github/checks-status/{user}/{repo}/{tag}': {
      get: {
        summary: 'GitHub tag status',
        description,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          pathParam({ name: 'tag', example: '3.3.0' }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'checks' }

  async handle({ user, repo, ref }) {
    const { state } = await this._requestJson({
      url: `/repos/${user}/${repo}/commits/${ref}/status`,
      httpErrors: httpErrorsFor('ref or repo not found'),
      schema,
    })

    return renderBuildStatusBadge({ status: state })
  }
}
