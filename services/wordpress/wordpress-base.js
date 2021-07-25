import Joi from 'joi'
import qs from 'qs'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound } from '../index.js'

const stringOrFalse = Joi.alternatives(Joi.string(), Joi.bool())

const themeSchema = Joi.object()
  .keys({
    version: Joi.string().required(),
    rating: nonNegativeInteger,
    num_ratings: nonNegativeInteger,
    downloaded: nonNegativeInteger,
    active_installs: nonNegativeInteger,
    last_updated: Joi.string().required(),
    requires_php: stringOrFalse.required(),
    requires: stringOrFalse.required(),
  })
  .required()

const pluginSchema = Joi.object()
  .keys({
    version: Joi.string().required(),
    rating: nonNegativeInteger,
    num_ratings: nonNegativeInteger,
    downloaded: nonNegativeInteger,
    active_installs: nonNegativeInteger,
    requires: stringOrFalse.required(),
    tested: Joi.string().required(),
    last_updated: Joi.string().required(),
    requires_php: stringOrFalse.required(),
  })
  .required()

const notFoundSchema = Joi.object()
  .keys({
    error: Joi.string().required(),
  })
  .required()

const pluginSchemas = Joi.alternatives(pluginSchema, notFoundSchema)
const themeSchemas = Joi.alternatives(themeSchema, notFoundSchema)

export default class BaseWordpress extends BaseJsonService {
  async fetch({ extensionType, slug }) {
    const url = `https://api.wordpress.org/${extensionType}s/info/1.2/`
    let schemas
    if (extensionType === 'plugin') {
      schemas = pluginSchemas
    } else if (extensionType === 'theme') {
      schemas = themeSchemas
    }

    const queryString = qs.stringify(
      {
        action: `${extensionType}_information`,
        request: {
          slug,
          fields: {
            active_installs: 1,
            sections: 0,
            homepage: 0,
            tags: 0,
            screenshot_url: 0,
            downloaded: 1,
            last_updated: 1,
            requires_php: 1,
          },
        },
      },
      { encode: false }
    )

    const json = await this._requestJson({
      url,
      schema: schemas,
      options: {
        qs: queryString,
      },
    })
    if ('error' in json) {
      throw new NotFound()
    }
    return json
  }
}
