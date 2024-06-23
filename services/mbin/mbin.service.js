import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService, InvalidParameter, pathParams } from '../index.js'

const schema = Joi.object({
  subscriptionsCount: Joi.number().required(),
}).required()

export default class Mbin extends BaseJsonService {
  static category = 'social'

  static route = {
    base: 'mbin',
    pattern: ':magazine',
  }

  static openApi = {
    '/mbin/{magazine}': {
      get: {
        summary: 'Mbin',
        description:
          'Mbin is a fork of Kbin, a content aggregator for the Fediverse.',
        parameters: pathParams({
          name: 'magazine',
          description: 'The magazine to query. This is CASE SENSITIVE.',
          example: 'teletext@fedia.io',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'magazine', namedLogo: 'activitypub' }

  static render({ magazine, members }) {
    return {
      label: `subscribe to ${magazine}`,
      message: metric(members),
      style: 'social',
      color: 'brightgreen',
    }
  }

  async fetch({ magazine }) {
    const splitAlias = magazine.split('@')
    // The magazine will be in the format of 'magazine@server'
    if (splitAlias.length !== 2) {
      throw new InvalidParameter({
        prettyMessage: 'invalid magazine',
      })
    }

    const mag = splitAlias[0]
    const host = splitAlias[1]

    const data = await this._requestJson({
      url: `https://${host}/api/magazine/name/${mag}`,
      schema,
      httpErrors: {
        404: 'magazine not found',
      },
    })

    return data.subscriptionsCount
  }

  async handle({ magazine }) {
    const members = await this.fetch({ magazine })
    return this.constructor.render({ magazine, members })
  }
}
