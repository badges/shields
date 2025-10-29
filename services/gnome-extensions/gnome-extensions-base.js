import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const extensionSchema = Joi.object({
  id: Joi.number().required(),
  uuid: Joi.string().required(),
  name: Joi.string().required(),
  creator: Joi.object({
    id: Joi.number().required(),
    username: Joi.string().required(),
  }),
  description: Joi.string().allow('').required(),
  created: Joi.date().required(),
  updated: Joi.date().required(),
  downloads: Joi.number().required(),
  popularity: Joi.number().required(),
  screenshot: Joi.string().allow(null).required(),
  icon: Joi.string().allow(null).required(),
  rating: Joi.number().required(),
  rated: Joi.number().required(),
  url: Joi.string().allow('').required(),
  donation_urls: Joi.array().items(Joi.string()).required(),
  link: Joi.string().required(),
})

export default class GnomeExtensionsBase extends BaseJsonService {
  async getExtension({ extensionId }) {
    return await this._requestJson({
      schema: extensionSchema,
      url: `https://extensions.gnome.org/api/v1/extensions/${extensionId}/`,
      httpErrors: {
        404: 'extension not found',
      },
    })
  }
}
