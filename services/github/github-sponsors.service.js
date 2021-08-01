import gql from 'graphql-tag'
import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { NotFound } from '../index.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { documentation, transformErrors } from './github-helpers.js'

const schema = Joi.object({
  data: Joi.object({
    repositoryOwner: Joi.object({
      sponsorshipsAsMaintainer: Joi.object({
        totalCount: nonNegativeInteger,
      }),
    }).allow(null),
  }).required(),
}).required()

export default class GithubSponsors extends GithubAuthV4Service {
  static category = 'funding'
  static route = { base: 'github/sponsors', pattern: ':user' }
  static examples = [
    {
      title: 'GitHub Sponsors',
      namedParams: { user: 'Homebrew' },
      staticPreview: this.render({ count: 217 }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'sponsors',
  }

  static render({ count }) {
    return {
      message: metric(count),
      color: 'blue',
    }
  }

  async fetch({ user }) {
    return this._requestGraphql({
      query: gql`
        query ($user: String!) {
          repositoryOwner(login: $user) {
            ... on User {
              sponsorshipsAsMaintainer {
                totalCount
              }
            }
            ... on Organization {
              sponsorshipsAsMaintainer {
                totalCount
              }
            }
          }
        }
      `,
      variables: { user },
      schema,
      transformErrors,
    })
  }

  transform({ data }) {
    if (data.repositoryOwner == null) {
      throw new NotFound({ prettyMessage: 'user/org not found' })
    }

    const count = data.repositoryOwner.sponsorshipsAsMaintainer.totalCount
    return { count }
  }

  async handle({ user }) {
    const json = await this.fetch({ user })
    const { count } = this.transform({ data: json.data })
    return this.constructor.render({
      count,
    })
  }
}
