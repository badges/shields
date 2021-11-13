import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { errorMessagesFor, documentation } from './github-helpers.js'

const schema = Joi.object({ total_count: nonNegativeInteger }).required()

export default class GithubSearch extends GithubAuthV3Service {
  static category = 'analysis'

  static route = {
    base: 'github/search',
    pattern: ':user/:repo/:query+',
  }

  static examples = [
    {
      title: 'GitHub search hit counter',
      pattern: ':user/:repo/:query',
      namedParams: {
        user: 'torvalds',
        repo: 'linux',
        query: 'goto',
      },
      staticPreview: this.render({ query: 'goto', totalCount: 14000 }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'counter',
  }

  static render({ query, totalCount }) {
    return {
      label: `${query} counter`,
      message: metric(totalCount),
      color: 'blue',
    }
  }

  async handle({ user, repo, query }) {
    const { total_count: totalCount } = await this._requestJson({
      url: '/search/code',
      options: {
        searchParams: {
          q: `${query} repo:${user}/${repo}`,
        },
      },
      schema,
      errorMessages: errorMessagesFor('repo not found'),
    })
    return this.constructor.render({ query, totalCount })
  }
}
