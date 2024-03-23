import Joi from 'joi'
import { age as ageColor } from '../color-formatters.js'
import { BaseJsonService, NotFound, pathParam, queryParam } from '../index.js'
import { formatDate } from '../text-formatters.js'

const schema = Joi.object({
  values: Joi.array().items({
    date: Joi.string().isoDate().required(),
  }),
}).required()

const queryParamSchema = Joi.object({
  path: Joi.string().uri({ relativeOnly: true }),
}).required()

export default class BitbucketLastCommit extends BaseJsonService {
  static category = 'activity'
  static route = {
    base: 'bitbucket/last-commit',
    pattern: ':user/:repo/:branch*',
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

  static render({ commitDate }) {
    return {
      message: formatDate(commitDate),
      color: ageColor(Date.parse(commitDate)),
    }
  }

  async fetch({ user, repo, branch, path }) {
    // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-commits/#api-repositories-workspace-repo-slug-commits-get
    return this._requestJson({
      url: `https://bitbucket.org/api/2.0/repositories/${user}/${repo}/commits/${branch}`,
      options: {
        searchParams: {
          path,
          // pagelen: 1,
          fields: 'values.date',
        },
      },
      schema,
      httpErrors: { 403: 'private repo' },
    })
  }

  async handle({ user, repo, branch }, queryParams) {
    const { path } = queryParams
    const data = await this.fetch({ user, repo, branch, path })
    const [commit] = data.values

    if (!commit) throw new NotFound()

    return this.constructor.render({ commitDate: commit.date })
  }
}
