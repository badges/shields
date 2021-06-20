import Joi from 'joi'
import { BaseJsonService, InvalidResponse } from '../index.js'

const sessionSchema = Joi.object({
  session: Joi.string().required(),
}).required()

const resourceSchema = Joi.object({
  promoted_versions: Joi.array()
    .items({
      version: Joi.string().required(),
      tags: Joi.array()
        .items({
          name: Joi.string().required(),
          display_data: Joi.string().allow(null),
        })
        .required(),
    })
    .required(),

  stats: Joi.object({
    stars: Joi.number().required(),
    downloads: Joi.number().required(),
  }).required(),

  category: Joi.string().required(),
  settings: Joi.object({
    license: Joi.object({
      name: Joi.string().allow(null).allow(''),
      url: Joi.string().allow(null).allow(''),
    }),
  }).required(),
}).required()

const documentation = `
<p>Your Plugin ID is the name of your plugin in lowercase, without any spaces or dashes.</p>
<p>Example: <code>https://ore.spongepowered.org/Erigitic/Total-Economy</code> - Here the Plugin ID is <code>totaleconomy<code/>.`

const keywords = ['sponge', 'spongemc', 'spongepowered']

class BaseOreService extends BaseJsonService {
  async _refreshSessionToken() {
    const requestOptions = {
      schema: sessionSchema,
      url: 'https://ore.spongepowered.org/api/v2/authenticate',
      options: { method: 'POST' },
    }
    const { session } = await this._requestJson(requestOptions)
    BaseOreService.sessionToken = session
  }

  async fetch({
    pluginId,
    schema = resourceSchema,
    url = `https://ore.spongepowered.org/api/v2/projects/${pluginId}`,
  }) {
    const requestOptions = {
      schema,
      url,
      options: {
        headers: {
          Authorization: `OreApi session=${BaseOreService.sessionToken}`,
        },
      },
    }

    try {
      return await this._requestJson(requestOptions)
    } catch (error) {
      if (error instanceof InvalidResponse) {
        const { response: _response } = error
        const { statusCode } = _response
        if (statusCode === 401) {
          await this._refreshSessionToken()
          requestOptions.options.headers.Authorization = `OreApi session=${BaseOreService.sessionToken}`
          return this._requestJson(requestOptions)
        }
      }
      throw error
    }
  }
}

BaseOreService.sessionToken = null

export { keywords, documentation, BaseOreService }
