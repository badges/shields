import gql from 'graphql-tag'
import Joi from 'joi'
import { pathParam } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { transformErrors } from './github-helpers.js'

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      discussions: Joi.object({
        totalCount: nonNegativeInteger,
      }).required(),
    }).required(),
  }).required(),
}).required()

const variantConfig = {
  total: { color: 'blue', suffix: 'total', answered: null },
  answered: { color: 'brightgreen', suffix: 'answered', answered: true },
  unanswered: { color: 'orange', suffix: 'unanswered', answered: false },
}

export default class GithubDiscussions extends GithubAuthV4Service {
  static category = 'other'
  static route = {
    base: 'github/discussions',
    pattern: ':user/:repo/:variant(answered|unanswered)?',
  }

  static openApi = {
    '/github/discussions/{user}/{repo}': {
      get: {
        summary: 'GitHub Discussions',
        parameters: [
          pathParam({ name: 'user', example: 'vercel' }),
          pathParam({ name: 'repo', example: 'next.js' }),
        ],
      },
    },
    '/github/discussions/{user}/{repo}/answered': {
      get: {
        summary: 'GitHub Answered Discussions',
        parameters: [
          pathParam({ name: 'user', example: 'vercel' }),
          pathParam({ name: 'repo', example: 'next.js' }),
        ],
      },
    },
    '/github/discussions/{user}/{repo}/unanswered': {
      get: {
        summary: 'GitHub Unanswered Discussions',
        parameters: [
          pathParam({ name: 'user', example: 'vercel' }),
          pathParam({ name: 'repo', example: 'next.js' }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'discussions', color: 'blue' }

  static render({ discussions, color }) {
    return { message: discussions, color }
  }

  async fetch({ user, repo, answered }) {
    return this._requestGraphql({
      query: gql`
        query ($user: String!, $repo: String!, $answered: Boolean) {
          repository(name: $repo, owner: $user) {
            discussions(answered: $answered) {
              totalCount
            }
          }
        }
      `,
      variables: { user, repo, answered },
      schema,
      options: { headers: { 'GraphQL-Features': 'discussions_api' } },
      transformErrors,
    })
  }

  async handle({ user, repo, variant }) {
    const { answered, color, suffix } = variantConfig[variant || 'total']
    const json = await this.fetch({ user, repo, answered })
    const {
      data: {
        repository: {
          discussions: { totalCount },
        },
      },
    } = json
    return this.constructor.render({
      discussions: `${totalCount} ${suffix}`,
      color,
    })
  }
}
