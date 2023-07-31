import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'

const schema = Joi.object({
  resultCount: nonNegativeInteger,
  results: Joi.array()
    .items(Joi.object({ version: Joi.string().required() }))
    .min(0),
}).required()

export default class Itunes extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'itunes/v',
    pattern: ':bundleId',
  }

  static openApi = {
    '/itunes/v/{bundleId}': {
      get: {
        summary: 'iTunes App Store',
        parameters: pathParams({
          name: 'bundleId',
          example: '803453959',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'itunes app store' }

  async fetch({ bundleId }) {
    return this._requestJson({
      schema,
      url: `https://itunes.apple.com/lookup?id=${bundleId}`,
    })
  }

  async handle({ bundleId }) {
    const data = await this.fetch({ bundleId })

    if (data.resultCount === 0) {
      // Note the 'not found' response from iTunes is:
      // status code = 200,
      // body = { "resultCount":0, "results": [] }
      throw new NotFound()
    }

    return renderVersionBadge({ version: data.results[0].version })
  }
}
