import Joi from 'joi'
import { renderDateBadge } from '../date.js'
import { BaseJsonService, NotFound, pathParam, queryParam } from '../index.js'
import { relativeUri } from '../validators.js'

const schema = Joi.object({
  values: Joi.array().items({
    date: Joi.string().isoDate().required(),
  }),
}).required()

const queryParamSchema = Joi.object({
  path: relativeUri,
}).required()

export default class BitbucketLastCommit extends BaseJsonService {
  static category = 'activity'
  static route = {
    base: 'bitbucket/last-commit',
    pattern: ':user/:repo/:branch+',
    queryParamSchema,
  }

  static openApi = {
    '/bitbucket/last-commit/{user}/{repo}/{branch}': {
      get: {
        summary: 'Bitbucket last commit',
        parameters: [
          pathParam({ name: 'user', example: 'shields-io' }),
          pathParam({ name: 'repo', example: 'test-repo' }),
          pathParam({ name: 'branch', example: 'main' }),
          queryParam({
            name: 'path',
            example: 'README.md',
            schema: { type: 'string' },
            description: 'File path to resolve the last commit for.',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'last commit' }

  async fetch({ user, repo, branch, path }) {
    // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-commits/#api-repositories-workspace-repo-slug-commits-get
    return this._requestJson({
      url: `https://bitbucket.org/api/2.0/repositories/${user}/${repo}/commits/${branch}`,
      options: {
        searchParams: {
          path,
          pagelen: 1,
          fields: 'values.date',
        },
      },
      schema,
      httpErrors: {
        403: 'private repo',
        404: 'user, repo or branch not found',
      },
    })
  }

  async handle({ user, repo, branch }, queryParams) {
    const { path } = queryParams
    const data = await this.fetch({ user, repo, branch, path })
    const [commit] = data.values

    if (!commit) throw new NotFound({ prettyMessage: 'no commits found' })

    return renderDateBadge(commit.date)
  }
}
