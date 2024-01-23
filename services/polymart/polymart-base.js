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
      }).required(),
      updates: Joi.object({
        latest: Joi.object({
          version: Joi.string().required(),
        }).required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

const notFoundResourceSchema = Joi.object({
  response: Joi.object({
    success: Joi.boolean().required(),
    errors: Joi.object().required(),
  }).required(),
})

const resourceFoundOrNotSchema = Joi.alternatives(
  resourceSchema,
  notFoundResourceSchema,
)

const description = `
<p>You can find your resource ID in the url for your resource page.</p>
<p>Example: <code>https://polymart.org/resource/polymart-plugin.323</code> - Here the Resource ID is 323.</p>`

class BasePolymartService extends BaseJsonService {
  async fetch({
    resourceId,
    schema = resourceFoundOrNotSchema,
    url = `https://api.polymart.org/v1/getResourceInfo/?resource_id=${resourceId}`,
  }) {
    return this._requestJson({
      schema,
      url,
    })
  }
}

export { description, BasePolymartService }
