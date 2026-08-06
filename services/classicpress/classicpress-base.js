import Joi from 'joi'
import { BaseJsonService, NotFound } from '../index.js'

const metaSchema = Joi.object()
  .keys({
    current_version: Joi.string().required(),
    requires_cp: Joi.string().allow('').required(),
    requires_php: Joi.string().allow('').required(),
  })
  .required()

const schema = Joi.array()
  .items(
    Joi.object().keys({
      meta: metaSchema,
    }),
  )
  .required()

export class BaseClassicpress extends BaseJsonService {
  async fetch({ extensionType, slug }) {
    const json = await this._requestJson({
      url: `https://directory.classicpress.net/wp-json/wp/v2/${extensionType}s/`,
      schema,
      options: {
        searchParams: { byslug: slug },
      },
    })
    if (json.length === 0) {
      throw new NotFound()
    }
    return json[0].meta
  }
}
