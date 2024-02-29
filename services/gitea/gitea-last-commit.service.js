import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl } from '../validators.js'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import GiteaBase from './gitea-base.js'
import { description, httpErrorsFor } from './gitea-helper.js'

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
    }).required(),
  )
  .required()
  .min(1)

const displayEnum = ['author', 'committer']

const queryParamSchema = Joi.object({
  gitea_url: optionalUrl,
  display_timestamp: Joi.string()
    .valid(...displayEnum)
    .default('author'),
}).required()

export default class GiteaLastCommit extends GiteaBase {
  static category = 'activity'

  static route = {
    base: 'gitea/last-commit',
    pattern: ':user/:repo/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/gitea/last-commit/{user}/{repo}': {
      get: {
        summary: 'Gitea Last Commit',
        description,
        parameters: [
          pathParam({
            name: 'user',
            example: 'gitea',
          }),
          pathParam({
            name: 'repo',
            example: 'tea',
          }),
          queryParam({
            name: 'display_timestamp',
            example: 'committer',
            schema: { type: 'string', enum: displayEnum },
            description: 'Defaults to `author` if not specified',
          }),
          queryParam({
            name: 'gitea_url',
            example: 'https://gitea.com',
          }),
        ],
      },
    },
    '/gitea/last-commit/{user}/{repo}/{branch}': {
      get: {
        summary: 'Gitea Last Commit (branch)',
        description,
        parameters: [
          pathParam({
            name: 'user',
            example: 'gitea',
          }),
          pathParam({
            name: 'repo',
            example: 'tea',
          }),
          pathParam({
            name: 'branch',
            example: 'main',
          }),
          queryParam({
            name: 'display_timestamp',
            example: 'committer',
            schema: { type: 'string', enum: displayEnum },
            description: 'Defaults to `author` if not specified',
          }),
          queryParam({
            name: 'gitea_url',
            example: 'https://gitea.com',
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

  async fetch({ user, repo, branch, baseUrl }) {
    // https://gitea.com/api/swagger#/repository
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v1/repos/${user}/${repo}/commits`,
      options: { searchParams: { sha: branch } },
      httpErrors: httpErrorsFor(),
    })
  }

  async handle(
    { user, repo, branch },
    {
      gitea_url: baseUrl = 'https://gitea.com',
      display_timestamp: displayTimestamp,
    },
  ) {
    const body = await this.fetch({
      user,
      repo,
      branch,
      baseUrl,
    })
    return this.constructor.render({
      commitDate: body[0].commit[displayTimestamp].date,
    })
  }
}
