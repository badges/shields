import Joi from 'joi'
import { BaseJsonService } from '../../core/base-service/index.js'

const projectSchema = Joi.object({
  stats: Joi.object({
    stars: Joi.number().required(),
    downloads: Joi.number().required(),
  }).required(),

  settings: Joi.object({
    license: Joi.object({
      name: Joi.string().allow(null).allow(''),
      url: Joi.string().allow(null).allow(''),
    }),
  }).required(),
})

const documentation = `
<p>The author is the name of the user or organization that owns the plugin. Slug is the name of the plugin.</p>`

const keywords = ['paper', 'papermc', 'paperspigot']

class BaseHangarService extends BaseJsonService {
  async fetch({
    author,
    slug,
    schema = projectSchema,
    url = `https://hangar.papermc.io/api/v1/projects/${author}/${slug}`,
  }) {
    return this._requestJson({
      schema,
      url,
    })
  }

  async fetchPlain({
    author,
    slug,
    searchParams = [],
    url = `https://hangar.papermc.io/api/v1/projects/${author}/${slug}/latestrelease`,
  }) {
    const { buffer } = await this._request({
      url,
      options: {
        searchParams,
      },
    })

    return buffer
  }
}

export { keywords, documentation, BaseHangarService }
