import Joi from 'joi'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'
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
      }).required(),
    }).required()
  )
  .required()

export default class GithubLastCommit extends GithubAuthV3Service {
  static category = 'activity'
  static route = { base: 'github/last-commit', pattern: ':user/:repo/:branch*' }
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
      errorMessages: errorMessagesFor(),
    })
  }

  async handle({ user, repo, branch }) {
    const body = await this.fetch({ user, repo, branch })
    return this.constructor.render({ commitDate: body[0].commit.author.date })
  }
}
