import Joi from 'joi'
import { renderDateBadge } from '../date.js'
import { NotFound, pathParam, queryParam } from '../index.js'
import { relativeUri } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.array()
  .items(
    Joi.object({
      commit: Joi.object({
        author: Joi.object({
          date: Joi.string().required(),
        }).required(),
        committer: Joi.object({
          date: Joi.string().required(),
        }).required(),
      }).required(),
    }),
  )
  .required()

const displayEnum = ['author', 'committer']

const queryParamSchema = Joi.object({
  path: relativeUri,
  display_timestamp: Joi.string()
    .valid(...displayEnum)
    .default('author'),
}).required()

export default class GithubLastCommit extends GithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github/last-commit',
    pattern: ':user/:repo/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/github/last-commit/{user}/{repo}': {
      get: {
        summary: 'GitHub last commit',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'google' }),
          pathParam({ name: 'repo', example: 'skia' }),
          queryParam({
            name: 'path',
            example: 'README.md',
            schema: { type: 'string' },
            description: 'File path to resolve the last commit for.',
          }),
          queryParam({
            name: 'display_timestamp',
            example: 'committer',
            schema: { type: 'string', enum: displayEnum },
            description: 'Defaults to `author` if not specified',
          }),
        ],
      },
    },
    '/github/last-commit/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub last commit (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'google' }),
          pathParam({ name: 'repo', example: 'skia' }),
          pathParam({ name: 'branch', example: 'infra/config' }),
          queryParam({
            name: 'path',
            example: 'README.md',
            schema: { type: 'string' },
            description: 'File path to resolve the last commit for.',
          }),
          queryParam({
            name: 'display_timestamp',
            example: 'committer',
            schema: { type: 'string', enum: displayEnum },
            description: 'Defaults to `author` if not specified',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'last commit' }

  async fetch({ user, repo, branch, path }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/commits`,
      options: { searchParams: { sha: branch, path, per_page: 1 } },
      schema,
      httpErrors: httpErrorsFor(),
    })
  }

  async handle({ user, repo, branch }, queryParams) {
    const { path, display_timestamp: displayTimestamp } = queryParams
    const body = await this.fetch({ user, repo, branch, path })
    const [commit] = body.map(obj => obj.commit)

    if (!commit) throw new NotFound({ prettyMessage: 'no commits found' })

    return renderDateBadge(commit[displayTimestamp].date)
  }
}
