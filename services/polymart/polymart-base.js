import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const resourceSchema = Joi.object({
  response: Joi.object({
    resource: Joi.object({
      price: Joi.number().required(),
      downloads: Joi.string().required(),
      reviews: Joi.object({
        count: Joi.number().required(),
        stars: Joi.number().required(),
      }),
      updates: Joi.object({
        latest: Joi.object({
          version: Joi.string().required(),
        }),
      }),
    }),
  }),
}).required()

const documentation = `
<p>You can find your resource ID in the url for your resource page.</p>
<p>Example: <code>https://polymart.org/resource/bedwars1058-private-games-addon.1620/</code> - Here the Resource ID is 1620.</p>`

class BasePolymartService extends BaseJsonService {
  async fetch({
    resourceId,
    schema = resourceSchema,
    url = `https://api.polymart.org/v1/getResourceInfo/?resource_id=${resourceId}`,
  }) {
    return this._requestJson({
      schema,
      url,
    })
  }
}

export { documentation, BasePolymartService }
