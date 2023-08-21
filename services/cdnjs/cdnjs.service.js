import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'

const cdnjsSchema = Joi.object({
  // optional due to non-standard 'not found' condition
  version: Joi.string(),
}).required()

export default class Cdnjs extends BaseJsonService {
  static category = 'version'
  static route = { base: 'cdnjs/v', pattern: ':library' }

  static openApi = {
    '/cdnjs/v/{library}': {
      get: {
        summary: 'Cdnjs',
        parameters: pathParams({
          name: 'library',
          example: 'jquery',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'cdnjs' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ library }) {
    const url = `https://api.cdnjs.com/libraries/${library}?fields=version`
    return this._requestJson({
      url,
      schema: cdnjsSchema,
    })
  }

  async handle({ library }) {
    const json = await this.fetch({ library })

    if (Object.keys(json).length === 0) {
      /* Note the 'not found' response from cdnjs is:
         status code = 200, body = {} */
      throw new NotFound()
    }

    return this.constructor.render({ version: json.version })
  }
}
