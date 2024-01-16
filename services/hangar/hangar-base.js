import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const description = `
<p><a href="https://hangar.papermc.io/">Hangar</a> is a plugin repository for the Paper, Waterfall and Folia platforms.</p>`

const resourceSchema = Joi.object({
  stats: Joi.object({
    views: Joi.number().required(),
    downloads: Joi.number().required(),
    recentViews: Joi.number().required(),
    recentDownloads: Joi.number().required(),
    stars: Joi.number().required(),
    watchers: Joi.number().required(),
  }).required(),
}).required()

class BaseHangarService extends BaseJsonService {
  static _cacheLength = 3600

  async fetch({
    slug,
    schema = resourceSchema,
    url = `https://hangar.papermc.io/api/v1/projects/${slug}`,
  }) {
    return this._requestJson({
      schema,
      url,
      httpErrors: {
        401: 'Api session missing, invalid or expired',
        403: 'Not enough permission to use this endpoint',
      },
    })
  }
}

export { description, BaseHangarService }
