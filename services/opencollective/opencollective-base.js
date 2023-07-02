import gql from 'graphql-tag'
import Joi from 'joi'
import { BaseGraphqlService } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'

const schema = Joi.object({
  data: Joi.object({
    account: Joi.object({
      name: Joi.string().required(),
      slug: Joi.string().required(),
      members: Joi.object({
        totalCount: nonNegativeInteger,
        nodes: Joi.array().items(
          Joi.object({
            tier: Joi.object({
              legacyId: Joi.number(),
              name: Joi.string(),
            }).allow(null),
          })
        ),
      }).required(),
    }).required(),
  }).required(),
}).required()

export default class OpencollectiveBase extends BaseGraphqlService {
  static category = 'funding'

  static buildRoute(base, withTierId) {
    return {
      base: `opencollective${base ? `/${base}` : ''}`,
      pattern: `:collective${withTierId ? '/:tierId' : ''}`,
    }
  }

  static render(backersCount, label) {
    return {
      label,
      message: metric(backersCount),
      color: backersCount > 0 ? 'brightgreen' : 'lightgrey',
    }
  }

  async fetchCollectiveInfo({ collective, accountType }) {
    return this._requestGraphql({
      schema,
      url: 'https://api.opencollective.com/graphql/v2',
      query: gql`
        query account($slug: String, $accountType: [AccountType]) {
          account(slug: $slug) {
            name
            slug
            members(accountType: $accountType, role: BACKER) {
              totalCount
              nodes {
                tier {
                  legacyId
                  name
                }
              }
            }
          }
        }
      `,
      variables: {
        slug: collective,
        accountType,
      },
      httpErrorMessages: {
        404: 'collective not found',
      },
      options: {
        headers: { 'content-type': 'application/json' },
      },
    })
  }

  getCnt(data) {
    const {
      data: {
        account: {
          members: { totalCount: cnt },
        },
      },
    } = data

    return cnt
  }
}
