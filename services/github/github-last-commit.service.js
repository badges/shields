import Joi from 'joi'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'
const commonExampleAttrs = {
  keywords: ['latest'],
  documentation,
}

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
    }).required()
  )
  .required()
  .min(1)

const queryParamSchema = Joi.object({
  display_timestamp: Joi.string()
    .valid('author', 'committer')
    .default('author'),
}).required()

export default class GithubLastCommit extends GithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github/last-commit',
    pattern: ':user/:repo/:branch*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub last commit',
      pattern: ':user/:repo',
      namedParams: {
        user: 'google',
        repo: 'skia',
      },
      staticPreview: this.render({ commitDate: '2013-07-31T20:01:41Z' }),
      ...commonExampleAttrs,
    },
    {
      title: 'GitHub last commit (branch)',
      pattern: ':user/:repo/:branch',
      namedParams: {
        user: 'google',
        repo: 'skia',
        branch: 'infra/config',
      },
      staticPreview: this.render({ commitDate: '2013-07-31T20:01:41Z' }),
      ...commonExampleAttrs,
    },
    {
      title: 'GitHub last commit (by committer)',
      pattern: ':user/:repo',
      namedParams: {
        user: 'google',
        repo: 'skia',
      },
      queryParams: { display_timestamp: 'committer' },
      staticPreview: this.render({ commitDate: '2022-10-15T20:01:41Z' }),
      ...commonExampleAttrs,
    },
  ]

  static defaultBadgeData = { label: 'last commit' }

  static render({ commitDate }) {
    return {
      message: formatDate(commitDate),
      color: ageColor(Date.parse(commitDate)),
    }
  }

  async fetch({ user, repo, branch }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/commits`,
      options: { searchParams: { sha: branch } },
      schema,
      httpErrors: httpErrorsFor(),
    })
  }

  async handle({ user, repo, branch }, queryParams) {
    const body = await this.fetch({ user, repo, branch })

    return this.constructor.render({
      commitDate: body[0].commit[queryParams.display_timestamp].date,
    })
  }
}
